import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import { API_BASE_URL } from "../../config/apiConfig";
import DefaultAvatar from "../../assets/avatar.png";
import Navbar from "../common/Navbar";
import { useToast } from "../common/Toast";

return (
  <div className="min-h-screen bg-gray-100">
    <Navbar user={user} />

    <div className="max-w-7xl mx-auto mt-6 h-[calc(100vh-130px)]">
      <div className="bg-white shadow-md rounded-lg overflow-hidden h-full flex">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-ExtraDarkColor mb-2">
              Messages
            </h2>

            {/* Search Bar */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-gray-100 px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-DarkColor focus:bg-white transition-colors"
                  placeholder="Search for users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-2.5">
                  {isSearching ? (
                    <div className="animate-spin h-5 w-5 border-2 border-DarkColor border-t-transparent rounded-full"></div>
                  ) : (
                    <i className="bx bx-search text-gray-500"></i>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {showSearchResults && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((result) => (
                        <li
                          key={result.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => startConversation(result)}
                        >
                          <div className="flex items-center p-3">
                            <img
                              src={result.profilePicture || DefaultAvatar}
                              alt={result.username}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="ml-3">
                              <p className="font-medium text-gray-800">
                                {result.firstName && result.lastName
                                  ? `${result.firstName} ${result.lastName}`
                                  : result.firstName ||
                                    result.lastName ||
                                    result.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                @{result.username}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No users found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Existing conversations */}
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeConversation?.userId === conversation.userId
                      ? "bg-gray-100"
                      : ""
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={conversation.profilePicture || DefaultAvatar}
                        alt={conversation.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-800">
                        {getDisplayName(conversation)}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.latestMessage
                          ? conversation.latestMessage.content
                          : "No messages yet"}
                      </p>
                    </div>
                    {conversation.latestMessage && (
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.latestMessage.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="mt-2 text-sm">
                  Search above to find users to message
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="w-2/3 flex flex-col">
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <img
                  src={activeConversation.profilePicture || DefaultAvatar}
                  alt={activeConversation.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="font-medium text-gray-800">
                    {getDisplayName(activeConversation)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    @{activeConversation.username}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`mb-4 flex ${
                        message.senderId === user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                          message.senderId === user.id
                            ? "bg-DarkColor text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.senderId === user.id
                              ? "text-gray-200"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p>No messages yet</p>
                      <p className="mt-2 text-sm">
                        Send a message to start the conversation
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-transparent"
                    placeholder="Type a message..."
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    className="bg-DarkColor text-white px-4 py-2 rounded-r-lg hover:bg-ExtraDarkColor transition-colors"
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <i className="bx bx-send"></i>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <i className="bx bx-message-detail text-6xl mb-4"></i>
                <h3 className="text-xl font-medium mb-2">
                  No conversation selected
                </h3>
                <p>
                  Select a conversation or search for a user to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default Messaging;
