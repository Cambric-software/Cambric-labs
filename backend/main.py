"""
CAMBRIC LABS - Backend API

FastAPI application providing the neural network engine API with Supabase integration.
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
import uuid
import json
from pathlib import Path
import asyncio

# Import neural network components
from neural import Neuron, Layer, Network, ActivationFunctions, LossFunctions
from training import Trainer, Backpropagation

# Initialize FastAPI app
app = FastAPI(
    title="CAMBRIC LABS API",
    description="Neural Network Laboratory - Learn AI by building it",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# In-memory storage for neurons and networks (for demo)
neurons_db: Dict[str, Dict[str, Any]] = {}
networks_db: Dict[str, Dict[str, Any]] = {}

# Initialize Supabase storage (graceful degradation if not available)
supabase_client = None
try:
    from supabase import create_client
    SUPABASE_URL = "https://dafgzzkerytjuvxzymnq.supabase.co"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmd6emtlcnl0anV2eHp5bW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTE1MDUsImV4cCI6MjA5OTI4NzUwNX0.bZdxqNuy1ZyHMGzBieq7BzUd6IUEhfHEZxL-YTka3DQ"
    supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
except Exception as e:
    print(f"Warning: Supabase not available: {e}")


# ==================== Pydantic Models ====================

class NeuronCreate(BaseModel):
    input_count: int
    weights: Optional[List[float]] = None
    bias: float = 0.0
    activation: str = 'relu'
    seed: Optional[int] = None


class LayerCreate(BaseModel):
    name: str
    input_dim: int
    output_dim: int
    activation: str = 'relu'
    seed: Optional[int] = None


class NetworkCreate(BaseModel):
    name: str = "Network"
    layers: List[LayerCreate] = []
    loss_function: str = 'mse'


class ForwardRequest(BaseModel):
    inputs: List[float]


class TrainCycleRequest(BaseModel):
    inputs: List[float]
    targets: List[float]
    learning_rate: float = 0.01


class TrainBatchRequest(BaseModel):
    X: List[List[float]]
    y: List[List[float]]
    cycles: int = 100
    learning_rate: float = 0.01
    batch_size: int = 1
    shuffle: bool = True
    validation_split: float = 0.0


class DatasetExample(BaseModel):
    inputs: List[float]
    targets: List[float]


class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    input_dim: int
    output_dim: int
    examples: List[DatasetExample] = []


class ExperimentCreate(BaseModel):
    name: str
    network: Optional[NetworkCreate] = None
    dataset_id: Optional[str] = None


# ==================== Utility Functions ====================

def get_activation_explanation(activation: str) -> Dict[str, Any]:
    """Get detailed explanation of an activation function."""
    return ActivationFunctions.get_info(activation)


def get_loss_explanation(loss: str) -> Dict[str, Any]:
    """Get detailed explanation of a loss function."""
    return LossFunctions.get_info(loss)


# ==================== Dependencies ====================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from Supabase auth token."""
    if not credentials:
        return None
    
    try:
        # Verify the JWT token with Supabase
        user = supabase_client.auth.get_user(credentials.credentials)
        return user.user if user else None
    except Exception:
        return None


# ==================== API Endpoints ====================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "name": "CAMBRIC LABS",
        "version": "1.0.0",
        "description": "Neural Network Laboratory - Learn AI by building it",
        "supabase_connected": supabase_client is not None
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "supabase_connected": supabase_client is not None
    }


# ==================== Neuron Endpoints ====================

@app.post("/api/neuron/create")
async def create_neuron(config: NeuronCreate):
    """Create a new neuron."""
    try:
        neuron = Neuron(
            input_count=config.input_count,
            weights=config.weights,
            bias=config.bias,
            activation=config.activation,
            seed=config.seed
        )
        return {
            "success": True,
            "neuron": neuron.get_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/neuron/forward")
async def neuron_forward(neuron_state: Dict, request: ForwardRequest):
    """Perform forward pass through a neuron."""
    try:
        neuron = Neuron(
            input_count=len(neuron_state['weights']),
            weights=neuron_state['weights'],
            bias=neuron_state['bias'],
            activation=neuron_state['activation']
        )
        result = neuron.forward(request.inputs)
        result['neuron_state'] = neuron.get_state()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/neuron/train")
async def neuron_train_step(neuron_state: Dict, request: TrainCycleRequest):
    """Perform one training step on a neuron."""
    try:
        neuron = Neuron(
            input_count=len(neuron_state['weights']),
            weights=neuron_state['weights'],
            bias=neuron_state['bias'],
            activation=neuron_state['activation']
        )
        
        # Forward pass
        forward_result = neuron.forward(request.inputs)
        
        # Compute loss (MSE)
        error = forward_result['output'] - request.targets[0]
        loss = error ** 2
        
        # Compute gradient and update
        backward_result = neuron.backward(
            output_gradient=2 * error,
            learning_rate=request.learning_rate
        )
        
        return {
            "success": True,
            "cycle": 1,
            "inputs": request.inputs,
            "targets": request.targets,
            "prediction": forward_result['output'],
            "loss": loss,
            "error": error,
            "gradient": 2 * error,
            "before": {
                "weights": neuron_state['weights'],
                "bias": neuron_state['bias']
            },
            "after": {
                "weights": neuron.get_state()['weights'],
                "bias": neuron.get_state()['bias']
            },
            "updates": backward_result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/neuron/batch-train")
async def batch_train_neuron(
    neuron_state: Dict,
    data: Dict[str, Any]
):
    """Train a neuron on a batch of examples."""
    try:
        neuron = Neuron(
            input_count=len(neuron_state['weights']),
            weights=neuron_state['weights'],
            bias=neuron_state['bias'],
            activation=neuron_state['activation']
        )
        
        learning_rate = data.get("learning_rate", 0.1)
        examples = data.get("examples", [])
        losses = []
        
        for example in examples:
            inputs = example["inputs"]
            target = example["target"]
            
            # Forward pass
            forward_result = neuron.forward(inputs)
            loss = (forward_result['output'] - target) ** 2
            losses.append(loss)
            
            # Backward pass and update
            error = forward_result['output'] - target
            neuron.backward(
                output_gradient=2 * error,
                learning_rate=learning_rate
            )
        
        avg_loss = sum(losses) / len(losses) if losses else 0
        
        return {
            "success": True,
            "examples_trained": len(examples),
            "average_loss": float(avg_loss),
            "final_weights": neuron.get_state()['weights'],
            "final_bias": neuron.get_state()['bias'],
            "losses": [float(l) for l in losses]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/neuron/explain/{activation}")
async def explain_activation(activation: str):
    """Get explanation of an activation function."""
    try:
        return get_activation_explanation(activation)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Network Endpoints ====================

@app.post("/api/network/create")
async def create_network(config: NetworkCreate):
    """Create a new neural network."""
    try:
        network = Network(name=config.name, loss_function=config.loss_function)
        
        for layer_config in config.layers:
            layer = Layer(
                name=layer_config.name,
                input_dim=layer_config.input_dim,
                output_dim=layer_config.output_dim,
                activation=layer_config.activation,
                seed=layer_config.seed
            )
            network.add_layer(layer)
        
        return {
            "success": True,
            "network": network.get_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/network/forward")
async def network_forward(network_data: Dict, request: ForwardRequest):
    """Perform forward pass through the network."""
    try:
        network = Network.from_dict(network_data)
        result = network.forward(request.inputs)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/network/train-cycle")
async def train_network_cycle(network_data: Dict, request: TrainCycleRequest):
    """Perform one training cycle on the network."""
    try:
        network = Network.from_dict(network_data)
        trainer = Trainer(network, loss_function=network.loss_function)
        
        result = trainer.single_cycle(
            inputs=request.inputs,
            targets=request.targets,
            learning_rate=request.learning_rate
        )
        
        result['network'] = network.to_dict()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/network/train")
async def train_network(network_data: Dict, request: TrainBatchRequest):
    """Train the network on a batch of data."""
    try:
        network = Network.from_dict(network_data)
        trainer = Trainer(network, loss_function=network.loss_function)
        
        # Train
        history = trainer.train(
            X=request.X,
            y=request.y,
            epochs=request.cycles,
            learning_rate=request.learning_rate,
            batch_size=request.batch_size,
            shuffle=request.shuffle,
            validation_split=request.validation_split
        )
        
        return {
            "success": True,
            "network": network.to_dict(),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/network/{network_id}/weights")
async def get_network_weights(network_id: str):
    """Get network weights and biases."""
    if network_id not in networks_db:
        raise HTTPException(status_code=404, detail="Network not found")
    
    network = networks_db[network_id]["network"]
    
    weights = []
    for i, layer in enumerate(network.layers):
        weights.append({
            "layer": i + 1,
            "name": layer.name,
            "weights": layer.weights.tolist(),
            "biases": layer.bias.tolist(),
            "shape": list(layer.weights.shape)
        })
    
    return {
        "success": True,
        "layers": weights,
        "total_parameters": network.get_total_parameters()
    }


# ==================== Experiment Endpoints ====================

@app.post("/api/experiments")
async def create_experiment(
    request: ExperimentCreate,
    user: Optional[Dict] = Depends(get_current_user)
):
    """Create a new experiment."""
    experiment_id = str(uuid.uuid4())
    
    # Build network from config
    if request.network:
        network = Network(name=request.name, loss_function=request.network.loss_function)
        for layer_config in request.network.layers:
            layer = Layer(
                name=layer_config.name,
                input_dim=layer_config.input_dim,
                output_dim=layer_config.output_dim,
                activation=layer_config.activation
            )
            network.add_layer(layer)
    else:
        network = Network(name=request.name)
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation="relu"))
    
    networks_db[experiment_id] = {
        "id": experiment_id,
        "network": network,
        "name": request.name,
        "description": "",
        "dataset_id": request.dataset_id
    }
    
    # Save to Supabase if available
    if supabase_client and user:
        try:
            supabase_client.table("experiments").insert({
                "id": experiment_id,
                "user_id": getattr(user, 'id', None),
                "name": request.name,
                "network": network.to_dict(),
                "dataset_id": request.dataset_id
            }).execute()
        except Exception as e:
            print(f"Failed to save to Supabase: {e}")
    
    return {
        "success": True,
        "experiment_id": experiment_id,
        "network": network.get_state()
    }


@app.get("/api/experiments")
async def list_experiments(user: Optional[Dict] = Depends(get_current_user)):
    """List all experiments."""
    experiments = []
    
    for exp_id, exp_data in networks_db.items():
        network = exp_data.get("network")
        if network:
            experiments.append({
                "id": exp_id,
                "name": exp_data.get("name", "Untitled"),
                "description": exp_data.get("description"),
                "layers": len(network.layers),
                "parameters": network.get_total_parameters()
            })
    
    # Sort by creation order
    experiments.sort(key=lambda x: x["id"], reverse=True)
    
    return {
        "success": True,
        "experiments": experiments[:50]
    }


@app.get("/api/experiments/{experiment_id}")
async def get_experiment(experiment_id: str):
    """Get experiment by ID."""
    if experiment_id not in networks_db:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    exp_data = networks_db[experiment_id]
    network = exp_data.get("network")
    
    return {
        "success": True,
        "id": experiment_id,
        "name": exp_data.get("name", "Untitled"),
        "description": exp_data.get("description"),
        "network": network.get_state() if network else None,
        "dataset_id": exp_data.get("dataset_id")
    }


@app.put("/api/experiments/{experiment_id}")
async def update_experiment(
    experiment_id: str,
    request: Dict[str, Any]
):
    """Update an experiment."""
    if experiment_id not in networks_db:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    exp_data = networks_db[experiment_id]
    
    if "name" in request:
        exp_data["name"] = request["name"]
        if exp_data.get("network"):
            exp_data["network"].name = request["name"]
    
    if "description" in request:
        exp_data["description"] = request["description"]
    
    return {
        "success": True,
        "experiment": exp_data.get("network").get_state() if exp_data.get("network") else None
    }


@app.delete("/api/experiments/{experiment_id}")
async def delete_experiment(experiment_id: str):
    """Delete an experiment."""
    if experiment_id not in networks_db:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    del networks_db[experiment_id]
    
    return {
        "success": True,
        "message": "Experiment deleted"
    }


# ==================== Dataset Endpoints ====================

@app.post("/api/datasets")
async def create_dataset(request: DatasetCreate):
    """Create a new dataset."""
    dataset_id = str(uuid.uuid4())
    
    # Validate examples
    warnings = []
    if len(request.examples) > 0:
        # Check for class imbalance
        labels = [ex.targets[0] for ex in request.examples]
        label_counts = {}
        for label in labels:
            label_counts[label] = label_counts.get(label, 0) + 1
        
        if len(label_counts) > 1:
            counts = list(label_counts.values())
            if max(counts) / min(counts) > 10:
                warnings.append({
                    "type": "imbalanced",
                    "message": f"Dataset is highly imbalanced. Max/min ratio: {max(counts)/min(counts):.1f}"
                })
    
    datasets[dataset_id] = {
        "id": dataset_id,
        "name": request.name,
        "description": request.description,
        "input_dim": request.input_dim,
        "output_dim": request.output_dim,
        "examples": [{"inputs": ex.inputs, "targets": ex.targets} for ex in request.examples]
    }
    
    return {
        "success": True,
        "dataset_id": dataset_id,
        "name": request.name,
        "type": "numerical",
        "input_dim": request.input_dim,
        "output_dim": request.output_dim,
        "example_count": len(request.examples),
        "warnings": warnings
    }


@app.get("/api/datasets")
async def list_datasets():
    """List all datasets."""
    datasets_list = []
    for ds_id, ds_data in datasets.items():
        datasets_list.append({
            "id": ds_id,
            "name": ds_data.get("name", "Untitled"),
            "description": ds_data.get("description"),
            "input_dim": ds_data.get("input_dim"),
            "output_dim": ds_data.get("output_dim"),
            "example_count": len(ds_data.get("examples", []))
        })
    
    return {
        "success": True,
        "datasets": datasets_list
    }


@app.get("/api/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    """Get dataset by ID."""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return {
        "success": True,
        "dataset": datasets[dataset_id]
    }


# ==================== Educational Endpoints ====================

@app.get("/api/concepts/neuron")
async def explain_neuron():
    """Explain what a neuron is."""
    return {
        "concept": "Neuron",
        "simple": "A neuron is like a tiny decision-maker. It looks at inputs, "
                  "decides how important each one is (weights), adds them up, "
                  "and produces an output.",
        "technical": "A neuron computes a weighted sum of its inputs, adds a bias, "
                     "and applies an activation function: output = activation(sum(x_i * w_i) + b)",
        "analogy": "Think of a neuron like a mixer in a recipe. Each ingredient (input) "
                   "gets added in a certain amount (weight), the cook adjusts the recipe (bias), "
                   "and the final dish is served (output)."
    }


@app.get("/api/concepts/weight")
async def explain_weight():
    """Explain what a weight is."""
    return {
        "concept": "Weight",
        "simple": "A weight tells the neuron how much to listen to each input. "
                  "A high weight means 'pay attention to this input', "
                  "a low weight means 'ignore this input'.",
        "technical": "A weight is a trainable parameter that scales an input's "
                     "contribution to the neuron's output during the weighted sum computation.",
        "analogy": "Weights are like volume knobs on a mixing board. Each input "
                   "has its own knob. Turn it up to hear more, turn it down to hear less."
    }


@app.get("/api/concepts/bias")
async def explain_bias():
    """Explain what a bias is."""
    return {
        "concept": "Bias",
        "simple": "Bias is like a baseline. Even if all inputs are zero, "
                  "the bias determines what the neuron outputs by default.",
        "technical": "Bias is a trainable parameter added to the weighted sum. "
                     "It allows the neuron to shift its activation function.",
        "analogy": "Bias is like a thermostat's baseline setting. Even if no one "
                   "is in the room (zero inputs), the heater can still turn on "
                   "to reach the preferred temperature."
    }


@app.get("/api/concepts/activation")
async def explain_activation_overview():
    """Explain activation functions in general."""
    return {
        "concept": "Activation Function",
        "simple": "An activation function decides if a neuron should 'fire' or not. "
                  "It turns the raw number into something more useful.",
        "technical": "An activation function introduces non-linearity into the network, "
                     "allowing it to learn complex patterns.",
        "common_types": [
            {"name": "ReLU", "description": "The simplest: if positive, keep it; if negative, make it zero"},
            {"name": "Sigmoid", "description": "Squishes numbers between 0 and 1"},
            {"name": "Tanh", "description": "Squishes numbers between -1 and 1"}
        ]
    }


@app.get("/api/concepts/layer")
async def explain_layer():
    """Explain what a layer is."""
    return {
        "concept": "Layer",
        "simple": "A layer is a group of neurons that work together. "
                  "Each neuron in a layer looks at the same inputs but with different weights.",
        "technical": "A dense layer connects every input to every neuron. "
                     "The layer's output becomes the next layer's input.",
        "analogy": "Think of layers like stages in an assembly line. Each stage "
                   "takes the previous stage's work, transforms it, and passes it along."
    }


@app.get("/api/concepts/training")
async def explain_training():
    """Explain neural network training."""
    return {
        "concept": "Training",
        "simple": "Training is when the network learns. It makes predictions, "
                  "sees how wrong it was, and adjusts its weights to be less wrong next time.",
        "technical": "Training uses gradient descent to minimize a loss function. "
                     "The gradient tells us which direction to adjust each weight.",
        "steps": [
            "1. Forward pass: Compute prediction",
            "2. Calculate loss: How wrong was the prediction?",
            "3. Backward pass: Compute gradients",
            "4. Update weights: Adjust in the direction that reduces loss"
        ]
    }


@app.get("/api/concepts/loss")
async def explain_loss():
    """Explain loss functions."""
    return {
        "concept": "Loss Function",
        "simple": "Loss is a score for how wrong the network's prediction was. "
                  "Lower loss = better prediction.",
        "technical": "The loss function measures the difference between predictions "
                     "and true values. Training minimizes this value.",
        "analogy": "Loss is like a distance measurement. If you're trying to hit "
                   "a target, loss is how far you missed."
    }


@app.get("/api/concepts/gradient")
async def explain_gradient():
    """Explain gradients."""
    return {
        "concept": "Gradient",
        "simple": "A gradient tells you which direction to move to make the loss smaller. "
                  "It's like a compass pointing downhill.",
        "technical": "A gradient is the partial derivative of the loss with respect "
                     "to each parameter. It indicates the slope of the loss surface.",
        "analogy": "Imagine standing on a hill in fog. The gradient tells you which "
                   "direction is downhill, so you know which way to step."
    }


@app.get("/api/concepts/backpropagation")
async def explain_backpropagation():
    """Explain backpropagation."""
    return {
        "concept": "Backpropagation",
        "simple": "Backpropagation is how the network learns. It figures out "
                  "how much each weight contributed to the error, starting from the end.",
        "technical": "Backpropagation uses the chain rule to compute gradients layer by layer, "
                     "propagating the error signal backward from output to input.",
        "steps": [
            "1. Start at the output layer",
            "2. Compute how much each weight affected the error",
            "3. Move to the previous layer and repeat",
            "4. Use all these gradients to update weights"
        ]
    }


@app.get("/api/why/{concept}")
async def get_why(concept: str):
    """Get educational explanation for a concept."""
    concept_lower = concept.lower()
    
    explanations = {
        "neuron": {
            "simple": "A neuron is like a tiny decision-maker. It takes in numbers, makes a calculation, and gives out a number.",
            "technical": "A neuron computes a weighted sum of inputs, adds a bias, and passes the result through an activation function.",
            "analogy": "Think of a neuron as a tiny chef tasting soup. It 'hears' different ingredients (inputs), considers how much of each (weights), and decides if the soup is good (output)."
        },
        "weight": {
            "simple": "A weight tells the neuron how much to pay attention to each input. Higher weight = more attention.",
            "technical": "A weight is a trainable parameter that scales its corresponding input during the weighted sum computation.",
            "analogy": "Imagine a volume knob. Turn it up and the input speaks loudly. Turn it down and the input whispers."
        },
        "bias": {
            "simple": "The bias is like a starting point or tendency. It helps the neuron make decisions even before seeing inputs.",
            "technical": "The bias is a trainable parameter added to the weighted sum before activation, allowing the neuron to shift its output.",
            "analogy": "Think of bias as a coffee habit. No matter what happens today, you're starting with a baseline tendency."
        },
        "activation": {
            "simple": "The activation function decides how excited the neuron gets. It turns the raw number into something useful.",
            "technical": "The activation function introduces non-linearity, allowing the network to learn complex patterns.",
            "analogy": "Like a fire alarm: when things get hot enough (past a threshold), it goes off. That's what ReLU does."
        },
        "layer": {
            "simple": "A layer is a group of neurons working together. Multiple layers let the network learn complex patterns.",
            "technical": "A layer is a collection of neurons that process inputs in parallel, each with their own weights and biases.",
            "analogy": "Think of layers as stages in an assembly line. Each stage transforms the work before passing it to the next."
        },
        "loss": {
            "simple": "Loss measures how wrong the network's prediction is. Lower loss = better prediction.",
            "technical": "Loss is a scalar value representing the difference between predicted and target outputs, used to guide training.",
            "analogy": "Loss is like a score in golf - you want it to be as low as possible."
        },
        "gradient": {
            "simple": "A gradient tells us which direction to move each weight to reduce loss.",
            "technical": "Gradients are partial derivatives of the loss with respect to each parameter, indicating the direction and rate of change.",
            "analogy": "Imagine you're on a hill in fog. The gradient tells you which way is downhill so you can walk to the lowest point."
        },
        "backpropagation": {
            "simple": "Backpropagation is how the network learns. It figures out which weights need to change to reduce the error.",
            "technical": "Backpropagation uses the chain rule to compute gradients of the loss with respect to all parameters by propagating error backwards through the network.",
            "analogy": "Like a teacher grading a test and then telling each student exactly what they got wrong."
        },
        "learning_rate": {
            "simple": "The learning rate controls how big steps the network takes when learning. Too fast and it overshoots. Too slow and it takes forever.",
            "technical": "The learning rate is a hyperparameter that scales gradient updates, controlling the step size during optimization.",
            "analogy": "Like adjusting your stride when walking. Too big and you stumble past your destination. Too small and you barely move."
        }
    }
    
    if concept_lower not in explanations:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    return explanations[concept_lower]


@app.get("/api/concepts")
async def list_concepts():
    """List all available concepts."""
    return {
        "concepts": [
            "neuron", "weight", "bias", "activation", "layer",
            "training", "loss", "gradient", "backpropagation", "learning_rate"
        ],
        "descriptions": {
            "neuron": "A neuron is like a tiny decision-maker",
            "weight": "A weight tells the neuron how much to pay attention",
            "bias": "Bias is like a starting point or tendency",
            "activation": "The activation function decides how excited the neuron gets",
            "layer": "A layer is a group of neurons working together",
            "training": "Training is when the network learns",
            "loss": "Loss measures how wrong the prediction is",
            "gradient": "A gradient tells us which direction to move",
            "backpropagation": "Backpropagation is how the network learns",
            "learning_rate": "The learning rate controls how big steps to take"
        }
    }


# ==================== Activation & Loss Endpoints ====================

@app.get("/api/activations")
async def list_activations():
    """List all available activation functions."""
    return {
        "activations": [
            {
                "name": "relu",
                "formula": "max(0, x)",
                "derivative": "1 if x > 0 else 0",
                "description": "Rectified Linear Unit - outputs the input if positive, otherwise 0",
                "use_cases": "Hidden layers in most neural networks"
            },
            {
                "name": "sigmoid",
                "formula": "1 / (1 + exp(-x))",
                "derivative": "sigmoid(x) * (1 - sigmoid(x))",
                "description": "S-shaped curve that maps any value to 0-1",
                "use_cases": "Binary classification output layers"
            },
            {
                "name": "tanh",
                "formula": "tanh(x)",
                "derivative": "1 - tanh(x)^2",
                "description": "Hyperbolic tangent - S-shaped curve that maps to -1 to 1",
                "use_cases": "Hidden layers, often better than sigmoid"
            },
            {
                "name": "identity",
                "formula": "x",
                "derivative": "1",
                "description": "No transformation - returns input as-is",
                "use_cases": "Regression output layers"
            },
            {
                "name": "softmax",
                "formula": "exp(x_i) / sum(exp(x_j))",
                "derivative": "softmax(x) * (1 - softmax(x))",
                "description": "Converts scores to probabilities that sum to 1",
                "use_cases": "Multi-class classification output layers"
            }
        ]
    }


@app.get("/api/losses")
async def list_losses():
    """List all available loss functions."""
    return {
        "losses": [
            {
                "name": "mse",
                "formula": "L = (1/n) * sum((y_pred - y_true)^2)",
                "description": "Mean Squared Error - penalizes larger errors more heavily",
                "use_cases": "Regression tasks",
                "derivative": "2 * (y_pred - y_true)"
            },
            {
                "name": "mae",
                "formula": "L = (1/n) * sum(|y_pred - y_true|)",
                "description": "Mean Absolute Error - treats all errors equally",
                "use_cases": "Regression tasks with outliers",
                "derivative": "sign(y_pred - y_true)"
            },
            {
                "name": "cross_entropy",
                "formula": "L = -sum(y_true * log(y_pred))",
                "description": "Cross Entropy - standard for classification",
                "use_cases": "Classification tasks",
                "derivative": "y_pred - y_true"
            }
        ]
    }


# ==================== Code Export Endpoints ====================

@app.post("/api/export/neuron")
async def export_neuron(neuron_state: Dict):
    """Export neuron as Python code."""
    try:
        neuron = Neuron(
            input_count=len(neuron_state['weights']),
            weights=neuron_state['weights'],
            bias=neuron_state['bias'],
            activation=neuron_state['activation']
        )
        
        code = f'''"""
CAMBRIC LABS - Exported Neuron
Generated automatically from CAMBRIC LABS
"""

import numpy as np


def relu(x):
    """ReLU activation function."""
    return np.maximum(0, x)


def relu_derivative(x):
    """Derivative of ReLU."""
    return (x > 0).astype(float)


def sigmoid(x):
    """Sigmoid activation function."""
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))


def sigmoid_derivative(x):
    """Derivative of sigmoid."""
    s = sigmoid(x)
    return s * (1 - s)


def tanh(x):
    """Tanh activation function."""
    return np.tanh(x)


def tanh_derivative(x):
    """Derivative of tanh."""
    return 1 - np.tanh(x) ** 2


def apply_activation(x, name):
    """Apply activation function by name."""
    if name == 'relu':
        return relu(x)
    elif name == 'sigmoid':
        return sigmoid(x)
    elif name == 'tanh':
        return tanh(x)
    return x


def activation_derivative(x, name):
    """Get derivative of activation function by name."""
    if name == 'relu':
        return relu_derivative(x)
    elif name == 'sigmoid':
        return sigmoid_derivative(x)
    elif name == 'tanh':
        return tanh_derivative(x)
    return np.ones_like(x)


class ExportedNeuron:
    """Exported neuron from CAMBRIC LABS.
    
    A neuron computes a weighted sum of inputs,
    adds a bias, and applies an activation function.
    """
    
    def __init__(self, input_dim, weights, bias, activation='relu'):
        self.input_dim = input_dim
        self.weights = np.array(weights)
        self.bias = bias
        self.activation = activation
    
    def forward(self, inputs):
        """Perform forward pass."""
        inputs = np.array(inputs)
        z = np.dot(inputs, self.weights) + self.bias
        return apply_activation(z, self.activation)
    
    def backward(self, target, output=None):
        """Compute gradients for training."""
        if output is None:
            output = self.forward(self.inputs)
        
        inputs = np.array(self.inputs)
        error = output - target
        
        z = np.dot(inputs, self.weights) + self.bias
        activation_grad = activation_derivative(z, self.activation)
        
        weight_gradient = error * activation_grad * inputs
        bias_gradient = error * activation_grad
        
        return {{
            'weight_gradients': weight_gradient,
            'bias_gradient': bias_gradient,
            'error': error
        }}
    
    def train(self, inputs, target, learning_rate=0.1):
        """Train the neuron on one example."""
        self.inputs = inputs
        output = self.forward(inputs)
        loss = (output - target) ** 2
        
        gradients = self.backward(target, output)
        
        self.weights -= learning_rate * gradients['weight_gradients']
        self.bias -= learning_rate * gradients['bias_gradient']
        
        return {{
            'output': float(output),
            'loss': float(loss),
            'gradients': {{
                'weights': gradients['weight_gradients'].tolist(),
                'bias': float(gradients['bias_gradient'])
            }}
        }}
    
    @staticmethod
    def create(input_dim, activation='relu'):
        """Create a new neuron with random weights (Xavier initialization)."""
        scale = np.sqrt(2.0 / input_dim)
        weights = np.random.randn(input_dim) * scale
        bias = 0.0
        return ExportedNeuron(input_dim, weights, bias, activation)
    
    def to_dict(self):
        """Convert to dictionary."""
        return {{
            'input_dim': self.input_dim,
            'weights': self.weights.tolist(),
            'bias': float(self.bias),
            'activation': self.activation
        }}
    
    @classmethod
    def from_dict(cls, data):
        """Create from dictionary."""
        return cls(
            data['input_dim'],
            data['weights'],
            data['bias'],
            data.get('activation', 'relu')
        )


if __name__ == "__main__":
    # Create neuron
    neuron = ExportedNeuron.create(input_dim={neuron.input_count}, activation='{neuron.activation}')
    
    # Set trained weights
    neuron.weights = np.array({neuron.weights.tolist()})
    neuron.bias = {neuron.bias}
    
    # Test
    inputs = [1.0, 2.0, 3.0]
    output = neuron.forward(inputs)
    print(f"Input: {{inputs}}")
    print(f"Output: {{output}}")
'''
        
        return {
            "success": True,
            "code": code,
            "language": "python",
            "metadata": {
                "input_dim": neuron.input_count,
                "output_dim": 1,
                "activation": neuron.activation,
                "parameters": neuron.input_count + 1
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/export/network")
async def export_network(network_id: str):
    """Export network as Python code."""
    if network_id not in networks_db:
        raise HTTPException(status_code=404, detail="Network not found")
    
    network = networks_db[network_id]["network"]
    
    # Generate comprehensive network code
    code_lines = [
        '"""',
        f'CAMBRIC LABS - Exported Neural Network',
        'Generated automatically from CAMBRIC LABS',
        '',
        f'Network: {network.name}',
        f'Architecture: {len(network.layers)} layers',
        f'Total Parameters: {network.get_total_parameters():,}',
        '"""',
        '',
        'import numpy as np',
        'from typing import List, Union, Optional',
        '',
        '',
        '# ==================== Activation Functions ====================',
        '',
        'def relu(x: np.ndarray) -> np.ndarray:',
        '    """ReLU: max(0, x)"""',
        '    return np.maximum(0, x)',
        '',
        'def relu_derivative(x: np.ndarray) -> np.ndarray:',
        '    """Derivative of ReLU"""',
        '    return (x > 0).astype(float)',
        '',
        'def sigmoid(x: np.ndarray) -> np.ndarray:',
        '    """Sigmoid: 1 / (1 + exp(-x))"""',
        '    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))',
        '',
        'def sigmoid_derivative(x: np.ndarray) -> np.ndarray:',
        '    """Derivative of Sigmoid"""',
        '    s = sigmoid(x)',
        '    return s * (1 - s)',
        '',
        'def tanh(x: np.ndarray) -> np.ndarray:',
        '    """Hyperbolic Tangent"""',
        '    return np.tanh(x)',
        '',
        'def tanh_derivative(x: np.ndarray) -> np.ndarray:',
        '    """Derivative of Tanh"""',
        '    return 1 - np.tanh(x) ** 2',
        '',
        'def softmax(x: np.ndarray) -> np.ndarray:',
        '    """Softmax: exp(x) / sum(exp(x))"""',
        '    exp_x = np.exp(x - np.max(x))',
        '    return exp_x / np.sum(exp_x, axis=1, keepdims=True)',
        '',
        'def identity(x: np.ndarray) -> np.ndarray:',
        '    """Identity: f(x) = x"""',
        '    return x',
        '',
        'ACTIVATION_FUNCTIONS = {',
        "    'relu': (relu, relu_derivative),",
        "    'sigmoid': (sigmoid, sigmoid_derivative),",
        "    'tanh': (tanh, tanh_derivative),",
        "    'softmax': (softmax, None),",
        "    'identity': (identity, None)",
        '}',
        '',
        '',
        '# ==================== Loss Functions ====================',
        '',
        'def mse_loss(y_pred: np.ndarray, y_true: np.ndarray) -> float:',
        '    """Mean Squared Error"""',
        '    return np.mean((y_pred - y_true) ** 2)',
        '',
        'def mse_derivative(y_pred: np.ndarray, y_true: np.ndarray) -> np.ndarray:',
        '    """Derivative of MSE"""',
        '    return 2 * (y_pred - y_true) / len(y_pred)',
        '',
        'LOSS_FUNCTIONS = {',
        "    'mse': (mse_loss, mse_derivative)",
        '}',
        '',
        '',
        '# ==================== Network Components ====================',
        '',
        'class Layer:',
        '    """A single dense layer of neurons."""',
        '',
        '    def __init__(self, input_dim: int, output_dim: int, activation: str = \'relu\'):',
        '        self.input_dim = input_dim',
        '        self.output_dim = output_dim',
        '        self.activation = activation',
        '        ',
        '        # Xavier/Glorot initialization',
        '        scale = np.sqrt(2.0 / (input_dim + output_dim))',
        '        self.weights = np.random.randn(input_dim, output_dim) * scale',
        '        self.bias = np.zeros((1, output_dim))',
        '        ',
        '        self.inputs = None',
        '        self.output = None',
        '        self.z = None',
        '',
        '    def forward(self, inputs: np.ndarray) -> np.ndarray:',
        '        """Forward pass through this layer."""',
        '        self.inputs = inputs',
        '        self.z = np.dot(inputs, self.weights) + self.bias',
        '        ',
        '        activation_fn, _ = ACTIVATION_FUNCTIONS.get(self.activation, (identity, None))',
        '        self.output = activation_fn(self.z)',
        '        ',
        '        return self.output',
        '',
        '    def backward(self, gradient: np.ndarray, learning_rate: float) -> np.ndarray:',
        '        """Backward pass through this layer."""',
        '        _, activation_deriv = ACTIVATION_FUNCTIONS.get(self.activation, (identity, None))',
        '        ',
        '        if activation_deriv is not None:',
        '            delta = gradient * activation_deriv(self.z)',
        '        else:',
        '            delta = gradient',
        '        ',
        '        weight_gradient = np.dot(self.inputs.T, delta) / len(delta)',
        '        bias_gradient = np.mean(delta, axis=0, keepdims=True)',
        '        ',
        '        self.weights -= learning_rate * weight_gradient',
        '        self.bias -= learning_rate * bias_gradient',
        '        ',
        '        return np.dot(delta, self.weights.T)',
        '',
        '    def to_dict(self) -> dict:',
        '        """Serialize layer to dictionary."""',
        '        return {',
        "            'input_dim': self.input_dim,",
        "            'output_dim': self.output_dim,",
        "            'activation': self.activation,",
        "            'weights': self.weights.tolist(),",
        "            'bias': self.bias.tolist()",
        '        }',
        '',
        '    @classmethod',
        '    def from_dict(cls, data: dict) -> \'Layer\':',
        '        """Deserialize layer from dictionary."""',
        '        layer = cls(data[\'input_dim\'], data[\'output_dim\'], data.get(\'activation\', \'relu\'))',
        '        layer.weights = np.array(data[\'weights\'])',
        '        layer.bias = np.array(data[\'bias\'])',
        '        return layer',
        '',
        '',
        'class Network:',
        '    """A neural network consisting of multiple layers."""',
        '',
        '    def __init__(self, name: str = "Network"):',
        '        self.name = name',
        '        self.layers: List[Layer] = []',
        '        self.loss_fn = \'mse\'',
        '',
        '    def add_layer(self, layer: Layer):',
        '        """Add a layer to the network."""',
        '        self.layers.append(layer)',
        '',
        '    def forward(self, inputs: Union[List, np.ndarray]) -> np.ndarray:',
        '        """Forward pass through the entire network."""',
        '        if not isinstance(inputs, np.ndarray):',
        '            inputs = np.array(inputs)',
        '        ',
        '        if inputs.ndim == 1:',
        '            inputs = inputs.reshape(1, -1)',
        '        ',
        '        output = inputs',
        '        for layer in self.layers:',
        '            output = layer.forward(output)',
        '        ',
        '        return output',
        '',
        '    def predict(self, inputs: Union[List, np.ndarray]) -> np.ndarray:',
        '        """Make predictions for multiple inputs."""',
        '        if not isinstance(inputs, np.ndarray):',
        '            inputs = np.array(inputs)',
        '        return np.array([self.forward(x) for x in inputs])',
        '',
        '    def train_step(self, inputs, targets, learning_rate: float = 0.1) -> dict:',
        '        """Perform one training step."""',
        '        outputs = self.forward(inputs)',
        '        ',
        '        if not isinstance(targets, np.ndarray):',
        '            targets = np.array(targets)',
        '        if targets.ndim == 1:',
        '            targets = targets.reshape(1, -1)',
        '        ',
        '        loss_fn, _ = LOSS_FUNCTIONS.get(self.loss_fn, (mse_loss, mse_derivative))',
        '        loss = loss_fn(outputs, targets)',
        '        ',
        '        _, loss_deriv = LOSS_FUNCTIONS.get(self.loss_fn, (mse_loss, mse_derivative))',
        '        gradient = loss_deriv(outputs, targets)',
        '        ',
        '        for layer in reversed(self.layers):',
        '            gradient = layer.backward(gradient, learning_rate)',
        '        ',
        '        return {{\'loss\': float(loss), \'predictions\': outputs.tolist()}}',
        '',
        '    def train(self, X, y, epochs=100, learning_rate=0.1, batch_size=32, verbose=True) -> dict:',
        '        """Train the network on a dataset."""',
        '        history = {\'loss\': []}',
        '        n_samples = len(X)',
        '        n_batches = max(1, n_samples // batch_size)',
        '        ',
        '        for epoch in range(epochs):',
        '            epoch_loss = 0',
        '            ',
        '            indices = np.random.permutation(n_samples)',
        '            X_shuffled = np.array(X)[indices]',
        '            y_shuffled = np.array(y)[indices]',
        '            ',
        '            for batch in range(n_batches):',
        '                start = batch * batch_size',
        '                end = min(start + batch_size, n_samples)',
        '                ',
        '                X_batch = X_shuffled[start:end]',
        '                y_batch = y_shuffled[start:end]',
        '                ',
        '                result = self.train_step(X_batch, y_batch, learning_rate)',
        '                epoch_loss += result[\'loss\']',
        '            ',
        '            avg_loss = epoch_loss / n_batches',
        '            history[\'loss\'].append(avg_loss)',
        '            ',
        '            if verbose and epoch % max(1, epochs // 10) == 0:',
        '                print(f"Epoch {{epoch}}/{{epochs}} - loss: {{avg_loss:.4f}}")',
        '        ',
        '        return history',
        '',
        '    def get_total_parameters(self) -> int:',
        '        """Get total number of trainable parameters."""',
        '        return sum(layer.weights.size + layer.bias.size for layer in self.layers)',
        '',
        '    def summary(self):',
        '        """Print network architecture summary."""',
        '        print(f"Network: {{self.name}}")',
        '        print(f"Layers: {{len(self.layers)}}")',
        '        print(f"Parameters: {{self.get_total_parameters():,}}")',
        '',
        '    def to_dict(self) -> dict:',
        '        """Serialize network to dictionary."""',
        '        return {\'name\': self.name, \'layers\': [layer.to_dict() for layer in self.layers]}',
        '',
        '    @classmethod',
        '    def from_dict(cls, data: dict) -> \'Network\':',
        '        """Deserialize network from dictionary."""',
        '        network = cls(name=data.get(\'name\', \'Network\'))',
        '        for layer_data in data.get(\'layers\', []):',
        '            network.add_layer(Layer.from_dict(layer_data))',
        '        return network',
        '',
        '',
        '# ==================== Build the Network ====================',
        '',
        'def create_network() -> Network:',
        f'    """Create and return the exported network: {network.name}"""',
        '    network = Network(name="' + network.name + '")',
    ]
    
    # Add layer definitions
    for i, layer in enumerate(network.layers):
        code_lines.append(f'    ')
        code_lines.append(f'    # Layer {i + 1}: {layer.output_dim} neurons')
        code_lines.append(f'    layer_{i+1} = Layer(')
        code_lines.append(f'        input_dim={layer.input_dim},')
        code_lines.append(f'        output_dim={layer.output_dim},')
        code_lines.append(f'        activation=\'{layer.activation}\'')
        code_lines.append(f'    )')
        code_lines.append(f'    layer_{i+1}.weights = np.array({layer.weights.tolist()})')
        code_lines.append(f'    layer_{i+1}.bias = np.array({layer.bias.tolist()})')
        code_lines.append(f'    network.add_layer(layer_{i+1})')
    
    code_lines.append('    return network')
    code_lines.append('')
    code_lines.append('')
    code_lines.append('# ==================== Example Usage ====================')
    code_lines.append('')
    code_lines.append('if __name__ == "__main__":')
    code_lines.append('    # Create network')
    code_lines.append('    network = create_network()')
    code_lines.append('    network.summary()')
    code_lines.append('    ')
    code_lines.append('    # Test on XOR')
    code_lines.append('    X_xor = [[0, 0], [0, 1], [1, 0], [1, 1]]')
    code_lines.append('    y_xor = [[0], [1], [1], [0]]')
    code_lines.append('    predictions = network.predict(X_xor)')
    code_lines.append('    print("Predictions:")')
    code_lines.append('    for inp, pred in zip(X_xor, predictions):')
    code_lines.append('        print(f"  {inp} -> {pred[0]:.4f}")')
    
    return {
        "success": True,
        "code": '\n'.join(code_lines),
        "language": "python",
        "metadata": {
            "name": network.name,
            "layers": len(network.layers),
            "parameters": network.get_total_parameters(),
            "architecture": [
                {
                    "name": layer.name,
                    "input_dim": layer.input_dim,
                    "output_dim": layer.output_dim,
                    "activation": layer.activation,
                    "parameters": layer.weights.size + layer.bias.size
                }
                for layer in network.layers
            ]
        }
    }


@app.post("/api/export/project/{experiment_id}")
async def export_project(experiment_id: str):
    """Export complete project including model, config, and code."""
    if experiment_id not in networks_db:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    exp_data = networks_db[experiment_id]
    network = exp_data["network"]
    
    # Generate all export data
    network_export = {
        "network": network.to_dict(),
        "total_parameters": network.get_total_parameters()
    }
    
    # Project metadata
    project_export = {
        "name": exp_data.get("name", "Untitled"),
        "description": exp_data.get("description"),
        "version": "1.0.0",
        "model": network_export
    }
    
    return {
        "success": True,
        "project": project_export,
        "download_ready": True
    }


# ==================== Comparison Endpoints ====================

@app.get("/api/compare")
async def compare_networks(network_ids: str):
    """Compare multiple networks."""
    ids = network_ids.split(",")
    networks_data = []
    
    for nid in ids:
        if nid in networks_db:
            network = networks_db[nid]["network"]
            networks_data.append({
                "id": nid,
                "name": networks_db[nid].get("name", "Untitled"),
                "layers": len(network.layers),
                "parameters": network.get_total_parameters(),
                "architecture": [
                    {"output_dim": l.output_dim, "activation": l.activation}
                    for l in network.layers
                ]
            })
    
    return {
        "success": True,
        "networks": networks_data
    }


# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
