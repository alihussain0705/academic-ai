from agents.research import research_agent
from agents.reviewer import reviewer_agent
from agents.summarizer import summarizer_agent
from agents.writer import writer_agent
from .planner import planner
from .executor import executor
from .progress_node import progress_node
from .routing import routing_function
from langgraph.graph import StateGraph,START,END
from state import State
from config import RESEARCH_RETRY,SUMMARIZER_RETRY,REVIEWER_RETRY,WRITER_RETRY
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()

builder = StateGraph(State)
# Adding Nodes

builder.add_node("researcher",research_agent,retry_policy=RESEARCH_RETRY)
builder.add_node("summarizer",summarizer_agent,retry_policy=SUMMARIZER_RETRY)
builder.add_node("reviewer",reviewer_agent,retry_policy=REVIEWER_RETRY)
builder.add_node("writer",writer_agent,retry_policy=WRITER_RETRY)

builder.add_node("planner",planner)
builder.add_node("executor",executor)
builder.add_node("progress_node",progress_node)

# Adding Edges

builder.add_edge(START,"planner")
builder.add_edge("planner","executor")
builder.add_conditional_edges(
    "executor",
    routing_function,{
        "research":"researcher",
        "summary":"summarizer",
        "review":"reviewer",
        "writer":"writer",
        "end":END
    }
)
builder.add_edge("researcher","progress_node")
builder.add_edge("summarizer","progress_node")
builder.add_edge("reviewer","progress_node")
builder.add_edge("writer","progress_node")
builder.add_edge("progress_node","executor")

graph = builder.compile(checkpointer=memory)

# result = graph.invoke({
#     "task":"Research Artificial Intelligence"
# })
# print(result['research'])
