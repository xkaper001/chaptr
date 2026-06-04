"use client"

import "@videojs/react/video/skin.css"
import { createPlayer, videoFeatures } from "@videojs/react"
import { VideoSkin, Video } from "@videojs/react/video"
import { selectTime } from "@videojs/core/dom"
import { useEffect, useRef, useState } from "react"
import type { TrackedFile } from "../types"

const Player = createPlayer({ features: videoFeatures })

interface VideoPlayerProps {
  file: TrackedFile
  onAutoComplete: () => void
}

function PlayerInner({ onAutoComplete }: { onAutoComplete: () => void }) {
  const timeState = Player.usePlayer(selectTime)
  const autoFiredRef = useRef(false)

  useEffect(() => {
    autoFiredRef.current = false
  }, [])

  useEffect(() => {
    if (autoFiredRef.current || !timeState) return
    const { currentTime, duration } = timeState
    if (duration > 0 && currentTime / duration >= 0.9) {
      autoFiredRef.current = true
      onAutoComplete()
    }
  }, [timeState, onAutoComplete])

  return null
}

export function VideoPlayer({ file, onAutoComplete }: VideoPlayerProps) {
  const [src, setSrc] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    setSrc(null)
    let url: string | null = null

    if (!file.handle) {
      console.warn("No file handle found for this video.");
      return;
    }

    file.handle
      .getFile()
      .then((blob) => {
        url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setSrc(url)
      })
      .catch(console.error)

    return () => {
      if (url) URL.revokeObjectURL(url)
      objectUrlRef.current = null
    }
  }, [file.path])

  if (!src) {
    return (
      <div className="flex h-[300px] md:h-[450px] items-center justify-center bg-black">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400" />
      </div>
    )
  }

  return (
    <Player.Provider>
      <div className="h-full bg-black relative overflow-hidden">
        <VideoSkin className="h-full w-full">
          <Video src={src} playsInline className="h-full w-full max-h-[500px]" />
        </VideoSkin>
        <PlayerInner onAutoComplete={onAutoComplete} />
      </div>
    </Player.Provider>
  )
}
