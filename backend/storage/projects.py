"""
Project Storage for CAMBRIC LABS

Local-first storage system for experiments and projects.
Projects are stored as JSON files with all necessary metadata.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import zipfile
import shutil


class ProjectStorage:
    """
    Local-first project storage.
    
    Projects are stored as directories with the following structure:
    
    project-name/
    ├── project.json      # Project metadata
    ├── model.json        # Network architecture and weights
    ├── dataset.json      # Dataset metadata
    ├── training.json     # Training history
    ├── config.json       # Configuration
    └── README.md         # Project documentation
    """
    
    def __init__(self, base_path: str = "./projects"):
        """
        Initialize storage.
        
        Args:
            base_path: Base directory for storing projects
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def create_project(
        self,
        name: str,
        description: str = "",
        network_data: Optional[Dict] = None,
        dataset_data: Optional[Dict] = None,
        config: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Create a new project.
        
        Args:
            name: Project name
            description: Project description
            network_data: Initial network configuration
            dataset_data: Dataset configuration
            config: Training configuration
            
        Returns:
            Created project metadata
        """
        # Sanitize name for filesystem
        safe_name = self._sanitize_name(name)
        project_dir = self.base_path / safe_name
        project_dir.mkdir(parents=True, exist_ok=True)
        
        project_id = safe_name
        
        project_meta = {
            "id": project_id,
            "name": name,
            "description": description,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "version": "1.0"
        }
        
        # Write project metadata
        with open(project_dir / "project.json", "w") as f:
            json.dump(project_meta, f, indent=2)
        
        # Write model data
        if network_data:
            with open(project_dir / "model.json", "w") as f:
                json.dump(network_data, f, indent=2)
        
        # Write dataset data
        if dataset_data:
            with open(project_dir / "dataset.json", "w") as f:
                json.dump(dataset_data, f, indent=2)
        
        # Write config
        if config:
            with open(project_dir / "config.json", "w") as f:
                json.dump(config, f, indent=2)
        
        # Write training history (empty initially)
        with open(project_dir / "training.json", "w") as f:
            json.dump({"history": [], "snapshots": []}, f, indent=2)
        
        return project_meta
    
    def get_project(self, project_id: str) -> Dict[str, Any]:
        """
        Load a project.
        
        Args:
            project_id: Project identifier
            
        Returns:
            Complete project data
        """
        project_dir = self.base_path / project_id
        
        if not project_dir.exists():
            raise FileNotFoundError(f"Project not found: {project_id}")
        
        project = {}
        
        # Load all components
        for filename in ["project.json", "model.json", "dataset.json", 
                        "config.json", "training.json"]:
            filepath = project_dir / filename
            if filepath.exists():
                with open(filepath, "r") as f:
                    key = filename.replace(".json", "")
                    project[key] = json.load(f)
        
        return project
    
    def list_projects(self) -> List[Dict[str, Any]]:
        """
        List all projects.
        
        Returns:
            List of project metadata (without full data)
        """
        projects = []
        
        for project_dir in self.base_path.iterdir():
            if project_dir.is_dir():
                meta_file = project_dir / "project.json"
                if meta_file.exists():
                    with open(meta_file, "r") as f:
                        meta = json.load(f)
                        # Add example count if dataset exists
                        dataset_file = project_dir / "dataset.json"
                        if dataset_file.exists():
                            with open(dataset_file, "r") as df:
                                dataset = json.load(df)
                                meta["example_count"] = len(dataset.get("examples", []))
                        projects.append(meta)
        
        return sorted(projects, key=lambda p: p.get("updated_at", ""), reverse=True)
    
    def update_project(self, project_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update project data.
        
        Args:
            project_id: Project identifier
            updates: Dictionary with keys like 'model', 'dataset', 'config', 'training'
        """
        project_dir = self.base_path / project_id
        
        if not project_dir.exists():
            raise FileNotFoundError(f"Project not found: {project_id}")
        
        for key, data in updates.items():
            filepath = project_dir / f"{key}.json"
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2)
        
        # Update timestamp
        meta_file = project_dir / "project.json"
        with open(meta_file, "r") as f:
            meta = json.load(f)
        meta["updated_at"] = datetime.now().isoformat()
        with open(meta_file, "w") as f:
            json.dump(meta, f, indent=2)
        
        return meta
    
    def delete_project(self, project_id: str) -> bool:
        """
        Delete a project.
        
        Args:
            project_id: Project identifier
            
        Returns:
            True if deleted
        """
        project_dir = self.base_path / project_id
        
        if project_dir.exists():
            shutil.rmtree(project_dir)
            return True
        return False
    
    def export_project(self, project_id: str, export_path: str) -> str:
        """
        Export project as a zip file.
        
        Args:
            project_id: Project identifier
            export_path: Path for the export file
            
        Returns:
            Path to exported file
        """
        project_dir = self.base_path / project_id
        
        if not project_dir.exists():
            raise FileNotFoundError(f"Project not found: {project_id}")
        
        export_file = Path(export_path)
        if not export_file.suffix:
            export_file = export_file.with_suffix(".cambric-project")
        
        with zipfile.ZipFile(export_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in project_dir.rglob("*"):
                if file_path.is_file():
                    arcname = file_path.relative_to(project_dir)
                    zipf.write(file_path, arcname)
        
        return str(export_file)
    
    def import_project(self, import_path: str) -> Dict[str, Any]:
        """
        Import a project from a zip file.
        
        Args:
            import_path: Path to the import file
            
        Returns:
            Imported project metadata
        """
        import_file = Path(import_path)
        
        if not import_file.exists():
            raise FileNotFoundError(f"Import file not found: {import_path}")
        
        # Create temporary directory
        temp_dir = self.base_path / "_temp_import"
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        temp_dir.mkdir(parents=True)
        
        try:
            # Extract zip
            with zipfile.ZipFile(import_file, 'r') as zipf:
                zipf.extractall(temp_dir)
            
            # Find project.json
            project_json = temp_dir / "project.json"
            if not project_json.exists():
                raise ValueError("Invalid project: missing project.json")
            
            with open(project_json, "r") as f:
                meta = json.load(f)
            
            # Create project directory
            safe_name = self._sanitize_name(meta.get("name", "imported"))
            project_dir = self.base_path / safe_name
            
            if project_dir.exists():
                # Add timestamp to avoid collision
                safe_name = f"{safe_name}_{int(datetime.now().timestamp())}"
                project_dir = self.base_path / safe_name
            
            # Move files
            shutil.move(str(temp_dir), str(project_dir))
            
            # Update ID
            meta["id"] = safe_name
            with open(project_dir / "project.json", "w") as f:
                json.dump(meta, f, indent=2)
            
            return meta
            
        finally:
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
    
    def _sanitize_name(self, name: str) -> str:
        """Convert project name to safe directory name."""
        # Replace spaces and special chars with underscores
        safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in name)
        # Remove leading/trailing underscores
        safe = safe.strip("_")
        return safe or "project"
