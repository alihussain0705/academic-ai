from state import State
from utils.logger import logger

VALID_ROUTES = {"research", "summary", "review", "writer", "end"}

def executor(state: State):
    plan = state['plan']
    current_step = state['current_step']
    logger.info(f"Current Step: {current_step}")

    if current_step >= len(plan):
        return {"route": "end"}

    route = plan[current_step]
    if route not in VALID_ROUTES:
        logger.warning(
            f"Invalid route {route!r} from plan at step {current_step}. "
            f"Falling back to 'writer'."
        )
        return {"route": "writer"}

    logger.info(f"Routing to: {route}")
    return {"route": route}