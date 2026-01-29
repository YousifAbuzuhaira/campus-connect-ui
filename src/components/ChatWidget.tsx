import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatMessages, useSendMessage } from "@/hooks/use-chat";
import { useAuth } from "@/contexts/AuthContext";
import { Send, MessageSquare, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ChatWidgetProps {
  chatId: string;
  otherUserName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWidget({
  chatId,
  otherUserName,
  isOpen,
  onClose,
}: ChatWidgetProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const { data: messages, isLoading: messagesLoading } =
    useChatMessages(chatId);
  const sendMessageMutation = useSendMessage(chatId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({
        text: messageInput.trim(),
      });
      setMessageInput("");
      scrollToBottom();
    } catch (error: unknown) {
      toast.error(
        (error as any)?.response?.data?.detail || "Failed to send message"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col shadow-xl z-50">
      {/* Header */}
      <div className="p-3 border-b border-border bg-background/95 backdrop-blur rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" /> {/* TODO: Add actual avatar image source when available */}
            <AvatarFallback className="text-xs">
              {otherUserName?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{otherUserName}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isFromCurrentUser = message.sender_id === user?.id;
              const showAvatar =
                index === 0 ||
                messages[index - 1].sender_id !== message.sender_id;

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-1 ${
                    isFromCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isFromCurrentUser && showAvatar && (
                    <Avatar className="h-6 w-6 mb-1">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">
                        {otherUserName?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isFromCurrentUser && !showAvatar && (
                    <div className="w-6 mb-1"></div>
                  )}

                  <div
                    className={`max-w-[70%] ${
                      isFromCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-1 rounded-lg text-sm ${
                        isFromCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{message.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(message.created_at || ""), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <Separator />
      <form
        onSubmit={handleSendMessage}
        className="p-2 bg-background rounded-b-lg"
      >
        <div className="flex gap-1">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 h-8 text-sm"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8"
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
