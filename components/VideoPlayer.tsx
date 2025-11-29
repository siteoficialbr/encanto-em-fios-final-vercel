'use client';

import { useEffect, useState, useRef } from 'react';

interface VideoPlayerProps {
    videoId: string;
    onTimeUpdate?: (seconds: number) => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function VideoPlayer({ videoId, onTimeUpdate }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlaySettings, setOverlaySettings] = useState({ imageUrl: '', durationMs: 1500 });
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const playerRef = useRef<any>(null);
    const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const watchTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const watchTimeRef = useRef(0);

    useEffect(() => {
        // Fetch overlay settings
        fetch('/api/config/overlay')
            .then(res => res.json())
            .then(data => setOverlaySettings(data))
            .catch(err => console.error('Error fetching overlay settings', err));
    }, []);

    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = initializePlayer;
        } else {
            initializePlayer();
        }

        return () => {
            if (watchTimeIntervalRef.current) {
                clearInterval(watchTimeIntervalRef.current);
            }
        };
    }, [videoId]);

    const initializePlayer = () => {
        playerRef.current = new window.YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'iv_load_policy': 3
            },
            events: {
                'onStateChange': onPlayerStateChange,
                'onReady': onPlayerReady
            }
        });
    };

    const onPlayerReady = () => {
        // Start watch time tracking
        watchTimeIntervalRef.current = setInterval(() => {
            if (playerRef.current && isPlaying) {
                watchTimeRef.current += 1;
                onTimeUpdate?.(watchTimeRef.current);
            }
        }, 1000);
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            showOverlayTemp();
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            showOverlayTemp();
        }
    };

    const showOverlayTemp = () => {
        if (!overlaySettings.imageUrl) return;

        setShowOverlay(true);

        if (overlayTimeoutRef.current) {
            clearTimeout(overlayTimeoutRef.current);
        }

        overlayTimeoutRef.current = setTimeout(() => {
            setShowOverlay(false);
        }, overlaySettings.durationMs);
    };

    const togglePlay = () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const changePlaybackRate = (rate: number) => {
        if (!playerRef.current) return;
        playerRef.current.setPlaybackRate(rate);
        setPlaybackRate(rate);
    };

    const seek = (seconds: number) => {
        if (!playerRef.current) return;
        const currentTime = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(currentTime + seconds, true);
    };

    return (
        <div className="video-wrapper">
            <div className="video-container">
                <div id="youtube-player"></div>
                <div
                    className="video-overlay"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                ></div>

                {/* Brand Overlay */}
                {showOverlay && overlaySettings.imageUrl && (
                    <div className="brand-overlay">
                        <img src={overlaySettings.imageUrl} alt="Encanto em Fios" />
                    </div>
                )}
            </div>

            {/* Custom Controls */}
            <div className="video-controls">
                <button
                    className="control-button secondary-control"
                    onClick={() => seek(-10)}
                    aria-label="Voltar 10 segundos"
                >
                    ⏪ -10s
                </button>

                <button
                    className="control-button play-button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                >
                    {isPlaying ? '⏸️' : '▶️'}
                </button>

                <button
                    className="control-button secondary-control"
                    onClick={() => seek(10)}
                    aria-label="Avançar 10 segundos"
                >
                    +10s ⏩
                </button>
            </div>

            {/* Speed Controls */}
            <div className="speed-controls">
                <span className="speed-label">Velocidade:</span>
                <button
                    className={`speed-button ${playbackRate === 0.5 ? 'active' : ''}`}
                    onClick={() => changePlaybackRate(0.5)}
                >
                    0.5x
                </button>
                <button
                    className={`speed-button ${playbackRate === 0.75 ? 'active' : ''}`}
                    onClick={() => changePlaybackRate(0.75)}
                >
                    0.75x
                </button>
                <button
                    className={`speed-button ${playbackRate === 1.0 ? 'active' : ''}`}
                    onClick={() => changePlaybackRate(1.0)}
                >
                    1.0x
                </button>
            </div>

            <style jsx>{`
                /* ... other styles ... */

                .video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: transparent; /* Keep transparent but blocking */
                    z-index: 50; /* High z-index to ensure it's on top of iframe */
                    cursor: default; /* Show default cursor to indicate no interaction */
                }

                .brand-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 60; /* Higher than blocking overlay */
                    pointer-events: none; /* Let clicks pass through to blocking overlay */
                    animation: fadeIn 0.3s ease-in;
                }

                .brand-overlay img {
                    max-width: 80%;
                    max-height: 80%;
                    object-fit: contain;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .video-controls {
                    display: flex;
                    justify-content: center;
                    gap: var(--spacing-md);
                    margin-top: var(--spacing-lg);
                    position: relative;
                    z-index: 5;
                    padding: var(--spacing-sm);
                    background: #fff;
                    border-radius: var(--border-radius);
                }

                .control-button {
                    padding: var(--spacing-md) var(--spacing-lg);
                    font-size: var(--font-size-heading3);
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: bold;
                }

                .play-button {
                    background: var(--color-primary);
                    color: white;
                    padding: var(--spacing-lg) var(--spacing-xl);
                    font-size: 2rem;
                }

                .play-button:hover {
                    background: var(--color-primary-dark);
                    transform: scale(1.05);
                }

                .secondary-control {
                    background: #f0f0f0;
                    color: #333;
                }

                .secondary-control:hover {
                    background: #e0e0e0;
                }

                .speed-controls {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: var(--spacing-sm);
                    margin-top: var(--spacing-md);
                    padding: var(--spacing-md);
                    background: #f9f9f9;
                    border-radius: var(--border-radius);
                }

                .speed-label {
                    font-size: var(--font-size-heading3);
                    font-weight: bold;
                    margin-right: var(--spacing-sm);
                }

                .speed-button {
                    padding: var(--spacing-md) var(--spacing-lg);
                    font-size: var(--font-size-heading3);
                    font-weight: bold;
                    border: 2px solid #ddd;
                    border-radius: var(--border-radius);
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 80px;
                }

                .speed-button:hover {
                    background: #f0f0f0;
                    border-color: var(--color-primary);
                }

                .speed-button.active {
                    background: var(--color-primary);
                    color: white;
                    border-color: var(--color-primary);
                }

                @media (max-width: 768px) {
                    .video-controls {
                        flex-direction: column;
                        gap: var(--spacing-sm);
                    }

                    .control-button {
                        width: 100%;
                        font-size: var(--font-size-body);
                    }

                    .speed-controls {
                        flex-wrap: wrap;
                    }

                    .speed-button {
                        flex: 1;
                        min-width: 70px;
                    }
                }
            `}</style>
        </div>
    );
}
