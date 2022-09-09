import React, { useEffect, useRef } from "react";

import { PreferenceList } from "@trycourier/react-preferences";

import { useAtBottom } from "~/hooks/use-at-bottom";
import Header from "./Header";
import Loading from "../Messages/loading";
import Message from "./Message";
import PaginationEnd from "../Messages/PaginationEnd";
import TabList from "../TabList";
import { useInbox, usePreferences } from "@trycourier/react-hooks";

import { InboxProps, ITab } from "../../types";

import CourierLogo from "~/assets/courier_logo_text.svg";
import styled from "styled-components";
import deepExtend from "deep-extend";

const ResponsiveContainer = styled.div<{ isMobile?: boolean }>(
  ({ theme, isMobile }) =>
    deepExtend(
      {
        ...(isMobile
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
            }
          : {
              background: "white",
            }),
      },
      theme?.container
    )
);

const DismissInbox = styled.button(({ theme }) =>
  deepExtend(
    {
      border: "none",
      borderRadius: "50%",
      position: "absolute",
      top: 6,
      right: 8,
      cursor: "pointer",
      width: 42,
      height: 42,
      background: "rgba(115, 129, 155, 0.6)",
      color: "white",
      transition: "background 100ms ease-in",

      "&:hover": {
        background: "rgba(115, 129, 155, 0.8)",
      },
    },
    theme?.dismissInbox
  )
);

const MessageList = styled.div<{ isMobile?: boolean }>(
  ({ isMobile, theme }) => {
    const defaultHeight = 300;

    const height = (() => {
      if (!isMobile) {
        return defaultHeight;
      }

      return `Calc(100vh - 205px)`;
    })();

    return deepExtend(
      {
        background: "rgba(255, 255, 255, 0.2)",
        overflow: "scroll",
        display: "flex",
        height,
        maxHeight: height,
        flexDirection: "column",
        borderTop: "1px solid rgba(203,213,224,.5)",
      },
      theme?.messageList?.container
    );
  }
);

const Empty = styled.div(({ theme }) =>
  deepExtend(
    {
      fontSize: "18px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "25px",
      letterSpacing: "0em",
      textAlign: "center",
      color: theme?.brand?.inapp?.emptyState?.textColor ?? "white",
      margin: "auto",
    },
    theme?.emptyState
  )
);

export const Footer = styled.div(({ theme }) =>
  deepExtend(
    {
      alignItems: "center",
      background: "white",
      display: "flex",
      fontSize: "10px",
      fontStyle: "normal",
      position: "relative",
      zIndex: 1,
      boxShadow: "0 14px 11px 18px #3445632e",
      fontWeight: "700",
      height: 45,
      justifyContent: "center",
      paddingRight: 18,
      svg: {
        marginTop: 2,
        marginLeft: -1,
      },

      a: {
        display: "inherit",
        color: "#B9C0CD",
      },
    },
    theme?.footer
  )
);

const Messages: React.ForwardRefExoticComponent<
  InboxProps & {
    isMobile?: boolean;
    ref: React.ForwardedRef<HTMLDivElement>;
  }
> = React.forwardRef(
  (
    {
      defaultIcon,
      formatDate,
      isMobile,
      labels,
      openLinksInNewTab,
      renderBlocks,
      renderFooter,
      renderHeader,
      renderMessage,
      renderNoMessages,
      renderTabs,
      title,
    },
    ref
  ) => {
    const { fetchRecipientPreferences } = usePreferences();

    const {
      brand,
      currentTab,
      fetchMessages,
      isLoading,
      markAllAsRead,
      messages = [],
      setCurrentTab,
      startCursor,
      tabs,
      toggleInbox,
      unreadMessageCount,
      view,
    } = useInbox();

    const messageListRef = useRef<HTMLDivElement>(null);

    const handleSetCurrentTab = (newTab: ITab) => {
      if (!messageListRef?.current) {
        return;
      }

      messageListRef.current.scrollTop = 0;
      setCurrentTab(newTab);
    };

    useAtBottom(
      messageListRef,
      () => {
        if (isLoading || !startCursor) {
          return;
        }

        fetchMessages({
          params: currentTab?.filters,
          after: startCursor,
        });
      },
      [isLoading, startCursor, currentTab]
    );

    useEffect(() => {
      fetchRecipientPreferences();
    }, []);

    const handleCloseInbox = (event: React.MouseEvent) => {
      event.preventDefault();
      toggleInbox(false);
    };

    return (
      <ResponsiveContainer ref={ref} isMobile={isMobile}>
        {isMobile && <DismissInbox onClick={handleCloseInbox}>X</DismissInbox>}
        {renderHeader ? (
          renderHeader({
            currentTab,
            labels,
            markAllAsRead,
            messages,
            title,
            unreadMessageCount,
          })
        ) : (
          <Header
            currentTab={currentTab}
            labels={labels}
            markAllAsRead={markAllAsRead}
            messages={messages}
            title={title}
            unreadMessageCount={unreadMessageCount}
          />
        )}
        {view === "messages" ? (
          <>
            {renderTabs ? (
              renderTabs({ tabs, currentTab })
            ) : (
              <TabList
                labels={labels}
                tabs={tabs}
                setCurrentTab={handleSetCurrentTab}
                currentTab={currentTab}
              />
            )}
            <MessageList
              ref={messageListRef}
              isMobile={isMobile}
              data-testid="messages"
            >
              {messages?.map((message) =>
                renderMessage ? (
                  renderMessage(message)
                ) : (
                  <Message
                    {...message}
                    defaultIcon={defaultIcon}
                    formatDate={formatDate}
                    key={message.messageId}
                    labels={labels}
                    openLinksInNewTab={openLinksInNewTab}
                    renderBlocks={renderBlocks}
                  />
                )
              )}
              {isLoading && <Loading />}
              {!isLoading &&
                messages?.length === 0 &&
                (renderNoMessages ? (
                  renderNoMessages({})
                ) : (
                  <Empty>
                    {labels?.emptyState ??
                      brand?.inapp?.emptyState?.text ??
                      "You have no notifications at this time"}
                  </Empty>
                ))}
              {!isLoading && messages?.length > 5 && !startCursor && (
                <PaginationEnd title="End Of The Road" />
              )}
            </MessageList>
          </>
        ) : (
          <PreferenceList />
        )}
        {renderFooter
          ? renderFooter({})
          : !brand?.inapp?.disableCourierFooter && (
              <Footer>
                <a href="https://www.courier.com">
                  Powered by&nbsp;&nbsp;
                  <CourierLogo />
                </a>
              </Footer>
            )}
      </ResponsiveContainer>
    );
  }
);

export default Messages;