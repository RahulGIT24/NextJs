"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Heading1, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useChat } from "ai/react";

function page() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const delimiter = "||";
  const initalMessage =
    "What's a dream destination you've always wanted to visit?||If you could learn any skill instantly, what would it be and why?||What's a book or movie that has profoundly impacted your perspective on life?";
  const {
    messages,
    isLoading: promptLoading,
    handleSubmit: promptSubmit,
    error,
  } = useChat({ api: "/api/suggest-messages", initialInput: initalMessage });
  const parseString = (messageString: string): string[] => {
    return messageString.split(delimiter);
  };

  useEffect(() => {
    const url = window.location.href.split("/");
    setUsername(url[url.length - 1]);
  }, []);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const { toast } = useToast();

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      setIsLoading(true);
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        content: data.content,
      });
      toast({
        title: "Message Send",
        description: response.data.message,
        variant: "default",
      });
      form.setValue("content", "");
      setMessageContent("");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: "Can't send Message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="my-5 text-center text-4xl font-bold">
        Public Profile Link
      </h1>
      <div className="mx-[15rem] font-semibold">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send Anonyms Message to @{username}</FormLabel>
                  <Textarea
                    {...field}
                    value={messageContent}
                    onChange={(e) => {
                      setMessageContent(e.target.value);
                      form.setValue("content",e.target.value)
                    }}
                    placeholder="Write your anonyms message here"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="my-4">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Send it"
              )}
            </Button>
          </form>
        </Form>
        <div>
          <form onSubmit={promptSubmit} className="my-5">
            <Button type="submit" disabled={promptLoading}>
              Suggest Messages
            </Button>
          </form>
          <p>Click on any message to select it</p>
          <div className="border rounded-md p-4">
            <h3 className="font-semibold text-2xl">Messages</h3>
            {error && (
              <h3 className="font-semibold text-red-500 text-xl">
                Something went wrong while fetching messages
              </h3>
            )}
            {messages.length === 0 ? (
              <>
                <ul className="mt-4 space-y-4">
                  {parseString(initalMessage).map((message, index) => {
                    return (
                      <li
                        key={index}
                        className="border hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                        onClick={() => {
                          setMessageContent(message);
                          form.setValue("content",message)
                        }}
                      >
                        <p>{message}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {!error && (
                      <ul className="mt-4 space-y-4">
                        {messages[1] && parseString(messages[1]['content']).map(
                          (message, index) => {
                            return (
                              <li
                                key={index}
                                className="border hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                                onClick={() => {
                                  setMessageContent(message);
                                  form.setValue("content",message)
                                }}
                              >
                                <p>{message}</p>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
