from prompts.planner import PLANNER_PROMPT
from config import llm
from state import State
from langchain_core.messages import SystemMessage,HumanMessage
from utils.logger import logger
import re

def planner(state: State):
    logger.info("Planner Started")
    completed_agents = []

    if state.get("research"):
        completed_agents.append("research")

    if state.get("summary"):
        completed_agents.append("summary")

    if state.get("review"):
        completed_agents.append("review")
    completed_agents_text = (
    ", ".join(completed_agents)
    if completed_agents
    else "None"
    )
    logger.info("========== PLANNER INPUT ==========")
    logger.info(f"Task: {state.get('task')}")
    logger.info(f"Messages: {state.get('messages')}")
    logger.info(f"Research: {state.get('research')}")
    logger.info("===================================")
    planner_input = f"""
    Task:
    {state["task"]}
    Completed Agents:
    {completed_agents_text}
    """
    print("\n========== PLANNER INPUT ==========")
    print("TASK:", repr(state.get("task")))
    print("MESSAGES:", state.get("messages"))
    print("RESEARCH:", repr(state.get("research")))
    print("PLAN:", repr(state.get("plan")))
    print("CURRENT STEP:", state.get("current_step"))
    print("===================================\n")
    response = llm.invoke([
        SystemMessage(content=PLANNER_PROMPT),
        HumanMessage(content=planner_input)
    ])
    

    content = re.sub(
    r"<think>.*?</think>",
    "",
    response.content,
    flags=re.DOTALL
    ).strip()

    plan = [
        step.strip().lower()
        for step in re.split(r"[,\n]+", content)
        if step.strip()
    ]
    print("\n========== PLANNER OUTPUT ==========")
    print("PLAN:", plan)
    print("====================================\n")
    logger.info(f"Generated Plan: {plan}")

    return {
        "plan": plan,
        "current_step": 0
    }