/* eslint-disable no-unused-vars */
import { CSSProperties } from "react";
import { TippyProps } from "@tippyjs/react";

type InboxThemeOptions = "root" | "body" | "footer" | "header";
type MessageThemeOptions = "root" | "title" | "body" | "icon" | "clickAction";

export interface ITab {
  filter: {
    isRead?: boolean;
  };
  label: string;
  id: string;
}
export interface InboxProps {
  className?: string;
  tabs?: Array<ITab>;
  defaultIcon?: false | string;
  placement?: TippyProps["placement"];
  renderFooter?: React.FunctionComponent;
  renderHeader?: React.FunctionComponent;
  renderIcon?: React.FunctionComponent<{
    hasUnreadMessages: boolean;
  }>;
  renderMessage?: React.FunctionComponent;
  theme?: ThemeObject;
  title?: string;
  trigger?: TippyProps["trigger"];
}

type ThemeObject = {
  //https://github.com/mui-org/material-ui/blob/master/packages/material-ui-styles/src/withStyles/withStyles.d.ts#L21
  [key in InboxThemeOptions | MessageThemeOptions | string]?:
    | CSSProperties
    | ThemeObject;
};

export interface IMessage {
  unread?: number;
  messageId: string;
  created: number;
  title: string;
  body: string;
  icon?: string;
  read: boolean;
  data?: {
    clickAction: string;
  };
  trackingIds?: {
    clickTrackingId: string;
    deliveredTrackingId: string;
    readTrackingId: string;
    unreadTrackingId: string;
  };
}
