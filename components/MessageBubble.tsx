import React from 'react';
import type { Message } from '../types';
import { BotIcon, UserIcon } from './Icons';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';

  const containerClasses = `flex items-start gap-3 max-w-xl ${isModel ? '' : 'ms-auto flex-row-reverse'}`;
  const bubbleClasses = `p-4 rounded-xl ${isModel ? 'bg-white text-slate-700 border border-slate-200 rounded-tr-none' : 'bg-indigo-600 text-white rounded-tl-none'}`;
  const avatarClasses = `w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${isModel ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`;

  return (
    <div className={containerClasses}>
      <div className={avatarClasses}>
        {isModel ? <BotIcon /> : <UserIcon />}
      </div>
      <div className={bubbleClasses}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};