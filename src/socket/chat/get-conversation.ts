import { getConversationList } from "../../helper/get-conversation-list.js";

export async function handleGetConversations(currentUserId: string, query: Record<string, unknown>) {
  const conversations = await getConversationList(currentUserId, query);
  return conversations;
}
