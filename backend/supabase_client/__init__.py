"""
Supabase client for CAMBRIC LABS

This module provides Supabase integration for storing experiments,
datasets, training history, and user data.
"""

import os
from typing import Dict, Any, List, Optional
from supabase import create_client, Client

# Supabase configuration is loaded exclusively from environment variables.
# No credentials are hardcoded. In a local-first deployment the Supabase
# integration is optional; when the required env vars are absent the storage
# layer degrades gracefully instead of crashing.
#
# Required for the anon (public/RLS-scoped) client:
#   SUPABASE_URL
#   SUPABASE_ANON_KEY
# Required additionally for the service-role (RLS-bypassing) client:
#   SUPABASE_SERVICE_ROLE_KEY   (server-side only — NEVER expose client-side)


def _required_env(name: str) -> str:
    """Read a required environment variable, failing clearly (no value printed)."""
    val = os.environ.get(name)
    if not val:
        raise RuntimeError(
            f"Required environment variable '{name}' is not set. "
            "Supabase integration is disabled until it is provided at runtime."
        )
    return val


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Global client instances
_supabase_client: Optional[Client] = None
_service_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Get or create the Supabase anon client singleton.

    Returns:
        Supabase client instance
    """
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(_required_env("SUPABASE_URL"), _required_env("SUPABASE_ANON_KEY"))
    return _supabase_client


def get_service_client() -> Client:
    """
    Get Supabase client with service role key (for admin operations).

    Returns:
        Supabase service client instance
    """
    global _service_client
    if _service_client is None:
        _service_client = create_client(_required_env("SUPABASE_URL"), _required_env("SUPABASE_SERVICE_ROLE_KEY"))
    return _service_client


class SupabaseStorage:
    """
    Supabase-based storage for CAMBRIC LABS experiments.
    
    This class provides a clean interface for storing and retrieving
    experiments, datasets, and training history.
    """
    
    def __init__(self, use_service_role: bool = False):
        """
        Initialize Supabase storage.
        
        Args:
            use_service_role: Whether to use service role key (bypasses RLS)
        """
        if use_service_role:
            self.client = get_service_client()
        else:
            self.client = get_supabase_client()
    
    # ==================== Experiments ====================
    
    async def create_experiment(self, experiment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new experiment.
        
        Args:
            experiment_data: Experiment data including name, network, etc.
            
        Returns:
            Created experiment with ID
        """
        response = self.client.table("experiments").insert(experiment_data).execute()
        return response.data[0] if response.data else None
    
    async def get_experiment(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get an experiment by ID.
        
        Args:
            experiment_id: UUID of the experiment
            
        Returns:
            Experiment data or None
        """
        response = self.client.table("experiments").select("*").eq("id", experiment_id).execute()
        return response.data[0] if response.data else None
    
    async def get_experiments(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get list of experiments.
        
        Args:
            user_id: Optional user ID to filter by
            limit: Maximum number of results
            
        Returns:
            List of experiments
        """
        query = self.client.table("experiments").select("*").order("updated_at", desc=True).limit(limit)
        if user_id:
            query = query.eq("user_id", user_id)
        response = query.execute()
        return response.data
    
    async def update_experiment(self, experiment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an experiment.
        
        Args:
            experiment_id: UUID of the experiment
            updates: Dictionary of fields to update
            
        Returns:
            Updated experiment data
        """
        updates["updated_at"] = "now()"
        response = self.client.table("experiments").update(updates).eq("id", experiment_id).execute()
        return response.data[0] if response.data else None
    
    async def delete_experiment(self, experiment_id: str) -> bool:
        """
        Delete an experiment.
        
        Args:
            experiment_id: UUID of the experiment
            
        Returns:
            True if deleted
        """
        response = self.client.table("experiments").delete().eq("id", experiment_id).execute()
        return len(response.data) > 0
    
    # ==================== Datasets ====================
    
    async def create_dataset(self, dataset_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new dataset.
        
        Args:
            dataset_data: Dataset data including name, examples, etc.
            
        Returns:
            Created dataset with ID
        """
        response = self.client.table("datasets").insert(dataset_data).execute()
        return response.data[0] if response.data else None
    
    async def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a dataset by ID.
        
        Args:
            dataset_id: UUID of the dataset
            
        Returns:
            Dataset data or None
        """
        response = self.client.table("datasets").select("*").eq("id", dataset_id).execute()
        return response.data[0] if response.data else None
    
    async def get_datasets(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get list of datasets.
        
        Args:
            user_id: Optional user ID to filter by
            limit: Maximum number of results
            
        Returns:
            List of datasets
        """
        query = self.client.table("datasets").select("*").order("created_at", desc=True).limit(limit)
        if user_id:
            query = query.eq("user_id", user_id)
        response = query.execute()
        return response.data
    
    async def update_dataset(self, dataset_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a dataset.
        
        Args:
            dataset_id: UUID of the dataset
            updates: Dictionary of fields to update
            
        Returns:
            Updated dataset data
        """
        response = self.client.table("datasets").update(updates).eq("id", dataset_id).execute()
        return response.data[0] if response.data else None
    
    async def delete_dataset(self, dataset_id: str) -> bool:
        """
        Delete a dataset.
        
        Args:
            dataset_id: UUID of the dataset
            
        Returns:
            True if deleted
        """
        response = self.client.table("datasets").delete().eq("id", dataset_id).execute()
        return len(response.data) > 0
    
    # ==================== Training History ====================
    
    async def add_training_snapshot(self, snapshot_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a training snapshot to history.
        
        Args:
            snapshot_data: Snapshot data including cycle, loss, weights, etc.
            
        Returns:
            Created snapshot with ID
        """
        response = self.client.table("training_history").insert(snapshot_data).execute()
        return response.data[0] if response.data else None
    
    async def get_training_history(
        self, 
        experiment_id: str, 
        limit: int = 1000
    ) -> List[Dict[str, Any]]:
        """
        Get training history for an experiment.
        
        Args:
            experiment_id: UUID of the experiment
            limit: Maximum number of snapshots
            
        Returns:
            List of training snapshots
        """
        response = (
            self.client.table("training_history")
            .select("*")
            .eq("experiment_id", experiment_id)
            .order("cycle", desc=False)
            .limit(limit)
            .execute()
        )
        return response.data
    
    async def get_latest_snapshot(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the latest training snapshot for an experiment.
        
        Args:
            experiment_id: UUID of the experiment
            
        Returns:
            Latest snapshot or None
        """
        response = (
            self.client.table("training_history")
            .select("*")
            .eq("experiment_id", experiment_id)
            .order("cycle", desc=True)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None
    
    # ==================== User Data ====================
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new user profile.
        
        Args:
            user_data: User data including email, name, etc.
            
        Returns:
            Created user with ID
        """
        response = self.client.table("users").insert(user_data).execute()
        return response.data[0] if response.data else None
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a user by ID.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            User data or None
        """
        response = self.client.table("users").select("*").eq("id", user_id).execute()
        return response.data[0] if response.data else None
    
    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a user profile.
        
        Args:
            user_id: UUID of the user
            updates: Dictionary of fields to update
            
        Returns:
            Updated user data
        """
        response = self.client.table("users").update(updates).eq("id", user_id).execute()
        return response.data[0] if response.data else None
    
    # ==================== Model Export ====================
    
    async def save_model_export(self, export_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save a model export record.
        
        Args:
            export_data: Export data including model, format, etc.
            
        Returns:
            Created export with ID
        """
        response = self.client.table("model_exports").insert(export_data).execute()
        return response.data[0] if response.data else None
    
    async def get_model_exports(
        self, 
        experiment_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get all exports for an experiment.
        
        Args:
            experiment_id: UUID of the experiment
            
        Returns:
            List of exports
        """
        response = (
            self.client.table("model_exports")
            .select("*")
            .eq("experiment_id", experiment_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    
    # ==================== Custom Neurons ====================
    
    async def save_custom_neuron(self, neuron_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save a custom neuron implementation.
        
        Args:
            neuron_data: Neuron data including code, tests, etc.
            
        Returns:
            Created neuron with ID
        """
        response = self.client.table("custom_neurons").insert(neuron_data).execute()
        return response.data[0] if response.data else None
    
    async def get_custom_neurons(
        self, 
        user_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get list of custom neurons.
        
        Args:
            user_id: Optional user ID to filter by
            limit: Maximum number of results
            
        Returns:
            List of custom neurons
        """
        query = self.client.table("custom_neurons").select("*").order("created_at", desc=True).limit(limit)
        if user_id:
            query = query.eq("user_id", user_id)
        response = query.execute()
        return response.data
    
    async def update_custom_neuron(
        self, 
        neuron_id: str, 
        updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update a custom neuron.
        
        Args:
            neuron_id: UUID of the neuron
            updates: Dictionary of fields to update
            
        Returns:
            Updated neuron data
        """
        response = self.client.table("custom_neurons").update(updates).eq("id", neuron_id).execute()
        return response.data[0] if response.data else None
    
    async def delete_custom_neuron(self, neuron_id: str) -> bool:
        """
        Delete a custom neuron.
        
        Args:
            neuron_id: UUID of the neuron
            
        Returns:
            True if deleted
        """
        response = self.client.table("custom_neurons").delete().eq("id", neuron_id).execute()
        return len(response.data) > 0


# Create default storage instances.
# These degrade gracefully to None when Supabase credentials are not provided
# via environment variables, so importing this module never crashes a
# local-first deployment that does not use Supabase.
storage: Optional["SupabaseStorage"] = None
admin_storage: Optional["SupabaseStorage"] = None
try:
    storage = SupabaseStorage()
except RuntimeError:
    # SUPABASE_URL / SUPABASE_ANON_KEY not configured — optional integration.
    pass
try:
    admin_storage = SupabaseStorage(use_service_role=True)
except RuntimeError:
    # SUPABASE_SERVICE_ROLE_KEY not configured — admin operations unavailable.
    pass
