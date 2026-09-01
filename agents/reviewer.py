from prompts.reviewer import REVIEW_PROMPT
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from config import llm
from state import State
from utils.logger import logger

agent = create_agent(
        model = llm,
        system_prompt = REVIEW_PROMPT
    )

def reviewer_agent(state: State):
    try:
        response = agent.invoke({
        "messages": [
            HumanMessage(content=f"Task: {state['task']} Research: {state['research']}")
        ]
        })
        return {"review":response['messages'][-1].content}
    except Exception as e:
            logger.exception(f"Reviewer Agent Failed: {e}")
            raise    