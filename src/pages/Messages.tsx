import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import {
  useChats,
  useChatMessages,
  useSendMessage,
  useMarkChatAsRead,
} from "@/hooks/use-chat";
import { useAuth } from "@/contexts/AuthContext";
import { Chat } from "@/lib/types";
import { Search, Send, MessageSquare, User, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function Messages() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMarkedChatRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Get chat ID from URL parameters
  useEffect(() => {
    const chatId = searchParams.get("chat");
    const initialMessage = searchParams.get("initial");

    if (chatId) {
      setSelectedChatId(chatId);

      // If there's an initial message, set it in the input
      if (initialMessage) {
        setMessageInput(decodeURIComponent(initialMessage));
      }
    }
  }, [searchParams]);

  const {
    data: chats,
    isLoading: chatsLoading,
    error: chatsError,
  } = useChats();
  const { data: messages, isLoading: messagesLoading } = useChatMessages(
    selectedChatId || ""
  );

  // If there's an authentication error, redirect immediately
  useEffect(() => {
    if (chatsError && (chatsError as any)?.response?.status === 401) {
      console.log("Authentication error in Messages component, redirecting...");
      navigate("/auth");
    }
  }, [chatsError, navigate]);
  const sendMessageMutation = useSendMessage(selectedChatId || "");
  const markChatAsReadMutation = useMarkChatAsRead();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark chat as read when selected
  useEffect(() => {
    if (
      selectedChatId &&
      user &&
      user.id &&
      lastMarkedChatRef.current !== selectedChatId
    ) {
      lastMarkedChatRef.current = selectedChatId;
      markChatAsReadMutation.mutate(selectedChatId);
    }
  }, [selectedChatId, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    try {
      await sendMessageMutation.mutateAsync({
        chat_id: selectedChatId,
        text: messageInput.trim(),
      });
      setMessageInput("");
      scrollToBottom();
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.detail;
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : "Failed to send message"
      );
    }
  };

  const getOtherUserName = (chat: Chat) => {
    if (!user) return "Unknown User";

    // Check which participant is the current user
    if (chat.participant_a_id === user.id) {
      return chat.participant_b_name || "Unknown User";
    } else {
      return chat.participant_a_name || "Unknown User";
    }
  };

  const getOtherUserId = (chat: Chat) => {
    if (!user) return null;

    // Return the ID of the other participant
    if (chat.participant_a_id === user.id) {
      return chat.participant_b_id;
    } else {
      return chat.participant_a_id;
    }
  };

  const getUnreadCount = (chat: Chat) => {
    if (!user || !chat.unread_count) return 0;
    const userKey = chat.participant_a_id === user.id ? "a" : "b";
    return chat.unread_count[userKey] || 0;
  };

  const filteredChats =
    chats?.filter((chat) => {
      if (!searchQuery) return true;
      const otherUserName = getOtherUserName(chat);
      return (
        otherUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }) || [];

  const selectedChat = chats?.find((chat) => chat.id === selectedChatId);
  const otherUserName = selectedChat
    ? getOtherUserName(selectedChat)
    : "Unknown User";
  const otherUserId = selectedChat ? getOtherUserId(selectedChat) : null;

  if (chatsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Loading your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Chat List Sidebar */}
        <div
          className={`w-full md:w-1/3 lg:w-1/4 border-r border-border bg-muted/30 ${
            selectedChatId ? "hidden md:block" : ""
          }`}
        >
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-semibold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {filteredChats.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="font-medium text-foreground mb-2">
                  No conversations yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a conversation by messaging someone from a listing
                </p>
                <Button onClick={() => navigate("/browse")} variant="outline">
                  Browse Listings
                </Button>
              </div>
            ) : (
              <div className="p-2">
                {filteredChats.map((chat) => {
                  const otherUserName = getOtherUserName(chat);
                  const unreadCount = getUnreadCount(chat);
                  const isSelected = chat.id === selectedChatId;

                  return (
                    <Card
                      key={chat.id}
                      className={`p-3 mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                        isSelected ? "ring-2 ring-primary bg-muted/50" : ""
                      }`}
                      onClick={() => setSelectedChatId(chat.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {otherUserName ? (
                              otherUserName.charAt(0).toUpperCase()
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {otherUserName}
                            </h4>
                            {chat.last_message_at && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(
                                  new Date(chat.last_message_at),
                                  { addSuffix: true }
                                )}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate pr-2">
                              {chat.last_message
                                ? chat.last_message.slice(0, 20) +
                                  (chat.last_message.length > 20 ? "..." : "")
                                : "No messages yet"}
                            </p>
                            {unreadCount > 0 && (
                              <Badge
                                variant="default"
                                className="h-5 min-w-[20px] text-xs"
                              >
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </Badge>
                            )}
                          </div>

                          {chat.productInfo && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <span className="text-muted-foreground">
                                About:{" "}
                              </span>
                              <span className="font-medium">
                                {chat.productInfo.title}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Area */}
        <div
          className={`flex-1 flex flex-col ${
            selectedChatId ? "" : "hidden md:flex"
          }`}
        >
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-background/95 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedChatId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {otherUserName ? (
                        otherUserName.charAt(0).toUpperCase()
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-medium">{otherUserName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {otherUserId ? `ID: ${otherUserId.slice(-8)}` : "Unknown"}
                    </p>
                  </div>

                  {selectedChat?.productInfo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/listing/${selectedChat.productId}`)
                      }
                    >
                      View Listing
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isFromCurrentUser = message.sender_id === user?.id;
                      const showAvatar =
                        index === 0 ||
                        messages[index - 1].sender_id !== message.sender_id;

                      return (
                        <div
                          key={message.id || `message-${index}`}
                          className={`flex items-end gap-2 ${
                            isFromCurrentUser ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {!isFromCurrentUser && showAvatar && (
                            <Avatar className="h-8 w-8 mb-1">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-xs">
                                {otherUserName?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!isFromCurrentUser && !showAvatar && (
                            <div className="w-8 mb-1"></div>
                          )}

                          <div
                            className={`max-w-[70%] ${
                              isFromCurrentUser ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isFromCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {message.messageType === "offer" &&
                                message.offerAmount && (
                                  <div className="mb-2 p-2 bg-background/10 rounded text-sm">
                                    <span className="font-medium">
                                      Offer: ${message.offerAmount}
                                    </span>
                                  </div>
                                )}
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(
                                new Date(message.created_at || ""),
                                { addSuffix: true }
                              )}
                              {!message.is_read && isFromCurrentUser && (
                                <span className="ml-2 text-primary">•</span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <Separator />
              <form onSubmit={handleSendMessage} className="p-4 bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={
                      !messageInput.trim() || sendMessageMutation.isPending
                    }
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            // No chat selected
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-6">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground mb-6">
                  Choose a conversation from the sidebar to start messaging, or
                  browse listings to start new conversations.
                </p>
                <Button onClick={() => navigate("/browse")} variant="outline">
                  Browse Listings
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
