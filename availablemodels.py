from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from config import llm
from tools.rag_tool import rag_tool

agent = create_agent(
    model=llm,
    tools=[rag_tool],
    system_prompt="Use the rag_tool when appropriate."
)

response = agent.invoke({
    "messages": [
        HumanMessage(content="What are pointers?")
    ],
    "college": "parul",
    "department": "computer",
    "semester": 3,
    "subject": "RUST"
})

print(response)