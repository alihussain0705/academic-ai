from state import State

def progress_node(state: State):
    current_step = state['current_step']
    return {
        "current_step": current_step + 1
    }