import { CursorMode, CursorState, ReactionEvent } from "@/types/type";
import { useBroadcastEvent, useMyPresence, useOthers } from "@liveblocks/react";
import React, { useCallback, useEffect, useState } from "react";

type props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  const others = useOthers();

  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  const broadcast = useBroadcastEvent();

  const [reactions, setReactions] = useState<Reaction[]>([]);

  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
    );
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      // concat all the reactions created on mouse click
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      // Broadcast the reaction to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) => 
    reactions.concat([
      {
        point: {x: event.x, y: event.y},
        value: event.value,
        timeStamp: Date.now();
      }
    ]))
  })

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: ""
        })
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector});
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/"){
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    }
  }, [updateMyPresence]);

 const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    // if cursor is not in reaction selector mode, update the cursor position
    if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      // get the cursor position in the canvas
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      // broadcast the cursor position to other users
      updateMyPresence({
        cursor: {
          x,
          y,
        },
      });
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    setCursorState({
      mode: CursorMode.Hidden,
    });
    updateMyPresence({
      cursor: null,
      message: null,
    });
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    updateMyPresence({
      cursor: {
        x,
        y,
      },
    });

     setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
      );
    },
    [cursorState.mode, setCursorState]
  );

 const handlePointerUp = useCallback(() => {
  setCursorState((state: CursorState) => 
    cursorState.mode === CursorMode.Reaction ? {...state, isPressed: false} : state
  );
 }, [cursorState.mode, setCursorState]);

 const handleContextMenuClick = useCallback((key: string) => {
  switch (key) {
    case "Chat":
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage: null,
        message: "",
      });
      break;

      case "Reaction":
        setCursorState({ mode: CursorMode.ReactionSelector});
        break;

      case "Undo":
        undo();
        break;

      case "Redo":
        redo();
        break;
      
  }
 }, [] )

  
  return 
};

export default Live;
