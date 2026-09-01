from state import State
from utils.logger import logger
def executor(state: State):
    plan = state['plan']
    current_step = state['current_step']
    logger.info(f"Current Step: {current_step}")

    if current_step >= len(plan):
        return {
            "route":"end"
        }
    logger.info(f"Routing to: {plan[current_step]}")
    return {
        "route":plan[current_step]
    }