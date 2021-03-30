import React, { useMemo } from "react";
import classNames from "classnames";

import distanceInWords from "date-fns/formatDistanceStrict";
import OptionsDropdown from "../OptionsDropdown";
import Actions from "../Actions";
import {
  Body,
  Container,
  Contents,
  getIcon,
  TimeAgo,
  Title,
  UnreadMarker,
} from "./styled";
import useInbox from "~/hooks/use-inbox";

interface MessageProps {
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

const Message: React.FunctionComponent<MessageProps> = ({
  created,
  title,
  body,
  icon,
  data,
  read,
  messageId,
  trackingIds = {},
}) => {
  const { readTrackingId, unreadTrackingId } = trackingIds;
  const {
    config, markMessageRead, markMessageUnread,
  } = useInbox();
  const renderedIcon = getIcon(icon ?? config?.defaultIcon);

  const timeAgo = useMemo(() => {
    if (!created) {
      return;
    }

    return distanceInWords(new Date(created).getTime(), Date.now(), {
      addSuffix: true,
      roundingMethod: "floor",
    });
  }, [created]);

  const actions = useMemo(() => [{
    href: data?.clickAction,
    label: "View Details",
  }], [data]);

  const options = useMemo(
    () =>
      [
        !read &&
          readTrackingId && {
          label: "Mark as Read",
          onClick: () => {
            if (!readTrackingId) {
              return;
            }

            markMessageRead(messageId, readTrackingId);
          },
        },

        read &&
          unreadTrackingId && {
          label: "Mark as Unread",
          onClick: () => {
            if (!unreadTrackingId) {
              return;
            }

            markMessageUnread(messageId, unreadTrackingId);
          },
        },
        /*{
        label: "Delete",
        onClick: () => {},
      },*/
      ].filter(Boolean),
    [markMessageRead, markMessageUnread, messageId, read, readTrackingId, unreadTrackingId],
  );
  return (
    <Container
      data-testid="inbox-message"
      className={classNames({
        read,
      })}
    >
      {!read && <UnreadMarker />}
      {renderedIcon}
      <Contents>
        <Title>{title}</Title>
        <Body>{body}</Body>
        <TimeAgo>{timeAgo}</TimeAgo>
      </Contents>
      <Actions actions={actions} />
      {options?.length ? <OptionsDropdown options={options} /> : undefined}
    </Container>
  );
};

export default Message;
