import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    AlertCircle,
    Sparkles,
    Star,
    Zap,
    Heart,
    Music,
    Palette,
} from "lucide-react";

// Constants
const THEMES = {
    rose: {
        from: "from-rose-50",
        via: "via-pink-50",
        to: "to-rose-100",
        primary: "rose",
        gradient: "from-rose-600 to-pink-600",
        colors: {
            100: "rose-100",
            200: "rose-200",
            300: "rose-300",
            400: "rose-400",
            500: "rose-500",
            600: "rose-600",
            700: "rose-700",
        },
    },
    blue: {
        from: "from-blue-50",
        via: "via-cyan-50",
        to: "to-blue-100",
        primary: "blue",
        gradient: "from-blue-600 to-cyan-600",
        colors: {
            100: "blue-100",
            200: "blue-200",
            300: "blue-300",
            400: "blue-400",
            500: "blue-500",
            600: "blue-600",
            700: "blue-700",
        },
    },
    green: {
        from: "from-emerald-50",
        via: "via-green-50",
        to: "to-emerald-100",
        primary: "emerald",
        gradient: "from-emerald-600 to-green-600",
        colors: {
            100: "emerald-100",
            200: "emerald-200",
            300: "emerald-300",
            400: "emerald-400",
            500: "emerald-500",
            600: "emerald-600",
            700: "emerald-700",
        },
    },
    purple: {
        from: "from-purple-50",
        via: "via-violet-50",
        to: "to-purple-100",
        primary: "purple",
        gradient: "from-purple-600 to-violet-600",
        colors: {
            100: "purple-100",
            200: "purple-200",
            300: "purple-300",
            400: "purple-400",
            500: "purple-500",
            600: "purple-600",
            700: "purple-700",
        },
    },
};

const ANIMATION_STYLES = `
@keyframes float-random {
    0%, 100% { 
        transform: translateY(0) translateX(0) rotate(0deg) scale(1); 
    }
    25% { 
        transform: translateY(-20px) translateX(10px) rotate(90deg) scale(1.1); 
    }
    50% { 
        transform: translateY(-10px) translateX(-15px) rotate(180deg) scale(0.9); 
    }
    75% { 
        transform: translateY(-15px) translateX(5px) rotate(270deg) scale(1.05); 
    }
}
@keyframes wiggle {
    0%, 100% { 
        transform: rotate(-3deg) scale(1); 
    }
    50% { 
        transform: rotate(3deg) scale(1.05); 
    }
}
@keyframes ripple {
    to { 
        transform: translate(-50%, -50%) scale(10); 
        opacity: 0; 
    }
}
@keyframes float-heart {
    0% { 
        transform: translateY(100px) scale(0); 
        opacity: 1; 
    }
    100% { 
        transform: translateY(-100px) scale(1); 
        opacity: 0; 
    }
}
.animate-ripple { 
    animation: ripple 1s ease-out; 
}
.animate-float-random { 
    animation: float-random 8s ease-in-out infinite; 
}
.animate-wiggle { 
    animation: wiggle 2s ease-in-out infinite; 
}
.animate-bounce-in-delayed { 
    animation: bounce-in 0.6s ease-out 0.2s both; 
}
.animate-float-staggered { 
    animation: float 6s ease-in-out infinite; 
}
.animate-float-heart { 
    animation: float-heart 3s ease-out forwards; 
}

/* Prevent text selection */
.no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

/* Ensure text visibility */
.text-visibility {
    text-shadow: 0 0 1px rgba(0,0,0,0.1);
    backface-visibility: hidden;
}
`;

// Sub-components
const BackgroundEffects = React.memo(({ theme }) => (
    <div className="absolute inset-0 overflow-hidden">
        <div
            className={`absolute -top-24 -left-24 w-48 h-48 bg-${theme.colors[200]} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow`}
        />
        <div
            className={`absolute -bottom-24 -right-24 w-48 h-48 bg-${theme.colors[300]} rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-medium`}
        />
        <div
            className={`absolute top-1/4 right-1/4 w-32 h-32 bg-${theme.colors[100]} rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float-slow`}
        />
    </div>
));

const FloatingParticles = React.memo(({ theme, count = 15 }) => (
    <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: count }, (_, i) => (
            <div
                key={i}
                className={`absolute w-2 h-2 rounded-full opacity-60 bg-${theme.colors[300]} animate-float-random`}
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 8}s`,
                    animationDuration: `${4 + Math.random() * 6}s`,
                }}
            />
        ))}
    </div>
));

const DynamicParticles = React.memo(({ particles, theme }) => (
    <>
        {particles.map((particle) => (
            <div
                key={particle.id}
                className={`absolute w-3 h-3 rounded-full bg-${theme.colors[400]} pointer-events-none`}
                style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    opacity: particle.life,
                    transform: `scale(${particle.life})`,
                }}
            />
        ))}
    </>
));

const FloatingHearts = React.memo(({ hearts }) => (
    <>
        {hearts.map((heart) => (
            <div
                key={heart.id}
                className="absolute pointer-events-none animate-float-heart"
                style={{
                    left: `${heart.x}%`,
                    animationDelay: `${heart.delay}s`,
                }}
            >
                <Heart className="w-6 h-6 text-red-400 fill-current" />
            </div>
        ))}
    </>
));

const EasterEggMessage = React.memo(
    ({ show }) =>
        show && (
            <div className="absolute top-10 animate-bounce-in z-50 no-select">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 transform transition-all duration-500">
                    <div className="flex items-center gap-3 text-rose-600">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <span className="font-semibold text-lg text-visibility">
                            Bạn tìm thấy Easter Egg! 🎉
                        </span>
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-gray-600 mt-2 text-visibility">
                        Có vẻ như bạn rất kiên nhẫn!
                    </p>
                </div>
            </div>
        ),
);

const NumberDisplay = React.memo(({ index, theme, isHovering }) => (
    <span
        className={`text-${
            theme.colors[600]
        } animate-bounce-in-delayed bg-gradient-to-br from-${
            theme.colors[600]
        } to-${
            theme.colors[400]
        } bg-clip-text text-transparent transform transition-all duration-300 no-select text-visibility ${
            isHovering === "404" ? "scale-110 rotate-6" : ""
        }`}
    >
        {index === 0 ? "4" : "4"}
    </span>
));

const AnimatedIcon = React.memo(({ theme, isHovering }) => (
    <div className="relative">
        <div
            className={`absolute inset-0 bg-${theme.colors[500]} rounded-full animate-ping opacity-20`}
        />
        <AlertCircle
            className={`w-20 h-20 mt-4 text-${
                theme.colors[600]
            } animate-wiggle transform transition-all duration-300 no-select ${
                isHovering === "404" ? "scale-125 rotate-180" : ""
            }`}
        />
    </div>
));

const AnimatedSeparator = React.memo(({ theme, isHovering }) => (
    <div
        className={`w-32 h-1 bg-gradient-to-r from-${theme.colors[400]} via-${
            theme.colors[500]
        } to-${
            theme.colors[400]
        } mx-auto mb-6 animate-slide-in rounded-full shadow-lg transform transition-all duration-300 no-select ${
            isHovering === "404" ? "scale-125 w-40" : ""
        }`}
    />
));

const NotFoundDisplay = React.memo(
    ({ theme, isHovering, setIsHovering, createFireworks }) => {
        const handleClick = useCallback(
            (e) => {
                e.stopPropagation();
                createFireworks();
            },
            [createFireworks],
        );

        return (
            <div className="mb-8 transform transition-all duration-1000 hover:scale-105 cursor-pointer no-select">
                <div className="flex justify-center items-center mb-4">
                    <div
                        onMouseEnter={() => setIsHovering("404")}
                        onMouseLeave={() => setIsHovering(null)}
                        onClick={handleClick}
                        className="relative"
                    >
                        <div
                            className={`absolute inset-0 bg-${theme.colors[400]}/20 rounded-full blur-2xl scale-150 animate-pulse-slow`}
                        />
                        <div className="relative flex justify-center items-center space-x-4 text-9xl font-bold">
                            <NumberDisplay
                                index={0}
                                theme={theme}
                                isHovering={isHovering}
                            />
                            <AnimatedIcon
                                theme={theme}
                                isHovering={isHovering}
                            />
                            <NumberDisplay
                                index={1}
                                theme={theme}
                                isHovering={isHovering}
                            />
                        </div>
                    </div>
                </div>
                <AnimatedSeparator theme={theme} isHovering={isHovering} />
            </div>
        );
    },
);

const MessageSection = React.memo(({ theme }) => (
    <div className="space-y-6 mb-8 transform transition-all duration-700 delay-300">
        <h1
            className={`font-playfair text-5xl md:text-6xl font-bold text-${theme.colors[700]} mb-6 animate-slide-up bg-gradient-to-r from-${theme.colors[700]} to-${theme.colors[500]} bg-clip-text text-transparent hover:scale-105 transform transition-all duration-300 cursor-default no-select text-visibility`}
        >
            Trang không tồn tại
        </h1>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300">
            <p className="text-xl text-gray-700 leading-relaxed animate-slide-up delay-500 text-visibility no-select">
                Xin lỗi, trang bạn đang tìm kiếm không thể tìm thấy. Có thể
                trang đã bị xóa hoặc địa chỉ không chính xác.
            </p>
        </div>
    </div>
));

const HoverStars = React.memo(() => (
    <>
        <Star className="absolute -top-2 -left-2 w-4 h-4 text-yellow-300 animate-float-fast" />
        <Star className="absolute -top-2 -right-2 w-3 h-3 text-yellow-300 animate-float-medium" />
        <Star className="absolute -bottom-2 -left-4 w-5 h-5 text-yellow-300 animate-float-slow" />
        <Star className="absolute -bottom-2 -right-4 w-4 h-4 text-yellow-300 animate-float-medium" />
    </>
));

const HomeButton = React.memo(
    ({ theme, navigate, setIsHovering, createFloatingHearts }) => {
        const handleClick = useCallback(
            (e) => {
                e.stopPropagation();
                navigate("/");
            },
            [navigate],
        );

        const handleMouseEnter = useCallback(
            (e) => {
                e.stopPropagation();
                setIsHovering("home");
                createFloatingHearts();
            },
            [setIsHovering, createFloatingHearts],
        );

        const handleMouseLeave = useCallback(
            (e) => {
                e.stopPropagation();
                setIsHovering(null);
            },
            [setIsHovering],
        );

        return (
            <button
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`group flex items-center gap-3 bg-gradient-to-r ${theme.gradient} text-white px-10 py-5 rounded-2xl font-bold hover:shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300 relative overflow-hidden shadow-xl no-select`}
            >
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                <HoverStars />
                <Home className="w-6 h-6 relative z-10 transform transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12 group-hover:animate-bounce" />
                <span className="relative z-10 text-lg text-visibility">
                    Về trang chủ
                </span>
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
        );
    },
);

const IconButton = React.memo(({ onClick, theme, children }) => {
    const handleClick = useCallback(
        (e) => {
            e.stopPropagation();
            onClick();
        },
        [onClick],
    );

    return (
        <button
            onClick={handleClick}
            className={`p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-${theme.colors[200]}/50 hover:shadow-lg transform hover:scale-110 transition-all duration-300 group no-select`}
        >
            {children}
        </button>
    );
});

const InteractiveTools = React.memo(
    ({ theme, toggleMusic, isMusicPlaying, cycleTheme, createFireworks }) => (
        <div className="flex gap-4">
            <IconButton onClick={toggleMusic} theme={theme}>
                <Music
                    className={`w-6 h-6 ${
                        isMusicPlaying
                            ? `text-${theme.colors[600]} animate-pulse`
                            : "text-gray-600"
                    } group-hover:scale-110 transition-transform`}
                />
            </IconButton>
            <IconButton onClick={cycleTheme} theme={theme}>
                <Palette
                    className={`w-6 h-6 text-${theme.colors[600]} group-hover:rotate-180 transition-transform duration-500`}
                />
            </IconButton>
            <IconButton onClick={createFireworks} theme={theme}>
                <Zap
                    className={`w-6 h-6 text-${theme.colors[600]} group-hover:animate-pulse`}
                />
            </IconButton>
        </div>
    ),
);

const ActionButtons = React.memo(
    ({
        theme,
        navigate,
        setIsHovering,
        createFloatingHearts,
        toggleMusic,
        isMusicPlaying,
        cycleTheme,
        createFireworks,
    }) => (
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up delay-700">
            <HomeButton
                theme={theme}
                navigate={navigate}
                setIsHovering={setIsHovering}
                createFloatingHearts={createFloatingHearts}
            />
            <InteractiveTools
                theme={theme}
                toggleMusic={toggleMusic}
                isMusicPlaying={isMusicPlaying}
                cycleTheme={cycleTheme}
                createFireworks={createFireworks}
            />
        </div>
    ),
);

const DecorativeElement = React.memo(({ index, theme }) => {
    const getGradientClass = useCallback(
        (idx) => {
            if (idx % 3 === 0)
                return `from-${theme.colors[300]} to-${theme.colors[400]}`;
            if (idx % 3 === 1)
                return `from-${theme.colors[200]} to-${theme.colors[300]}`;
            return `from-${theme.colors[100]} to-${theme.colors[200]}`;
        },
        [theme],
    );

    const handleMouseEnter = useCallback((e) => {
        e.currentTarget.classList.add("animate-pulse");
    }, []);

    const handleMouseLeave = useCallback((e) => {
        e.currentTarget.classList.remove("animate-pulse");
    }, []);

    return (
        <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br cursor-pointer transform transition-all duration-300 hover:scale-125 hover:rotate-45 ${getGradientClass(
                index,
            )} shadow-lg animate-float-staggered no-select`}
            style={{
                animationDelay: `${index * 0.3}s`,
                rotate: `${index * 15}deg`,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
});

const DecorativeElements = React.memo(({ theme }) => (
    <div className="mt-16 flex justify-center gap-8 opacity-80">
        {Array.from({ length: 5 }, (_, index) => (
            <DecorativeElement key={index} index={index} theme={theme} />
        ))}
    </div>
));

const InteractiveHint = React.memo(() => (
    <div className="mt-8 animate-fade-in delay-1000">
        <div className="bg-white/40 backdrop-blur-sm rounded-full px-6 py-3 inline-block border border-white/30 transform hover:scale-105 transition-all duration-300 cursor-help group no-select">
            <p className="text-gray-600 text-sm flex items-center gap-2 text-visibility">
                <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                💡 Khám phá các tính năng tương tác ẩn!
                <Sparkles className="w-4 h-4 group-hover:animate-spin" />
            </p>
        </div>
    </div>
));

// Main Component
const NotFoundPage = () => {
    const navigate = useNavigate();
    const [isHovering, setIsHovering] = useState(null);
    const [clickCount, setClickCount] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [particles, setParticles] = useState([]);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [colorTheme, setColorTheme] = useState("rose");
    const [floatingHearts, setFloatingHearts] = useState([]);

    const clickTimeoutRef = useRef(null);
    const particleAnimationRef = useRef(null);

    const currentTheme = useMemo(() => THEMES[colorTheme], [colorTheme]);

    console.log(clickCount);

    // Debounced click handler
    const handleBackgroundClick = useCallback(
        (e) => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }

            clickTimeoutRef.current = setTimeout(() => {
                setClickCount((prev) => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        setShowEasterEgg(true);
                        createFireworks();
                        setTimeout(() => {
                            setShowEasterEgg(false);
                            setClickCount(0);
                        }, 5000);
                        return 0;
                    }
                    return newCount;
                });
                createRipple(e);
                createClickParticles(e);
            }, 150);
        },
        [currentTheme],
    );

    const createRipple = useCallback(
        (e) => {
            const ripple = document.createElement("div");
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.className = `absolute w-4 h-4 bg-${currentTheme.colors[300]} rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ripple`;

            e.currentTarget.appendChild(ripple);
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 1000);
        },
        [currentTheme],
    );

    const createClickParticles = useCallback((e) => {
        const newParticles = [];
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < 5; i++) {
            // Reduced from 8 to 5
            newParticles.push({
                id: Date.now() + i,
                x,
                y,
                vx: (Math.random() - 0.5) * 8, // Reduced velocity
                vy: (Math.random() - 0.5) * 8,
                life: 1,
            });
        }
        setParticles((prev) => {
            const combined = [...prev, ...newParticles];
            // Limit total particles to prevent performance issues
            return combined.slice(-50);
        });
    }, []);

    const createFireworks = useCallback(() => {
        const fireworks = [];
        for (let i = 0; i < 20; i++) {
            // Reduced from 30 to 20
            fireworks.push({
                id: Date.now() + i,
                x: 50 + Math.random() * 50,
                y: 50 + Math.random() * 50,
                vx: (Math.random() - 0.5) * 15, // Reduced velocity
                vy: (Math.random() - 0.5) * 15,
                life: 1,
            });
        }
        setParticles((prev) => {
            const combined = [...prev, ...fireworks];
            return combined.slice(-70); // Limit total particles
        });
    }, []);

    const createFloatingHearts = useCallback(() => {
        const newHearts = [];
        for (let i = 0; i < 8; i++) {
            // Reduced from 12 to 8
            newHearts.push({
                id: Date.now() + i,
                x: Math.random() * 100,
                delay: Math.random() * 5,
            });
        }
        setFloatingHearts(newHearts);
        setTimeout(() => setFloatingHearts([]), 3000);
    }, []);

    // Optimized particle animation with requestAnimationFrame
    useEffect(() => {
        if (particles.length === 0) return;

        const animateParticles = () => {
            setParticles((prev) =>
                prev
                    .map((p) => ({
                        ...p,
                        x: p.x + p.vx,
                        y: p.y + p.vy,
                        life: p.life - 0.03, // Faster fade out
                    }))
                    .filter((p) => p.life > 0),
            );

            if (particles.length > 0) {
                particleAnimationRef.current =
                    requestAnimationFrame(animateParticles);
            }
        };

        particleAnimationRef.current = requestAnimationFrame(animateParticles);

        return () => {
            if (particleAnimationRef.current) {
                cancelAnimationFrame(particleAnimationRef.current);
            }
        };
    }, [particles.length]);

    const toggleMusic = useCallback(
        (e) => {
            if (e) e.stopPropagation();
            setIsMusicPlaying(!isMusicPlaying);
            console.log(isMusicPlaying ? "Music stopped" : "Music playing");
        },
        [isMusicPlaying],
    );

    const cycleTheme = useCallback(
        (e) => {
            if (e) e.stopPropagation();
            const themeKeys = Object.keys(THEMES);
            const currentIndex = themeKeys.indexOf(colorTheme);
            const nextIndex = (currentIndex + 1) % themeKeys.length;
            setColorTheme(themeKeys[nextIndex]);
        },
        [colorTheme],
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
            if (particleAnimationRef.current) {
                cancelAnimationFrame(particleAnimationRef.current);
            }
        };
    }, []);

    return (
        <div
            className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${currentTheme.from} ${currentTheme.via} ${currentTheme.to} relative overflow-hidden cursor-pointer transition-all duration-1000 no-select`}
            onClick={handleBackgroundClick}
        >
            <style jsx>{ANIMATION_STYLES}</style>

            <BackgroundEffects theme={currentTheme} />
            <FloatingParticles theme={currentTheme} />
            <DynamicParticles particles={particles} theme={currentTheme} />
            <FloatingHearts hearts={floatingHearts} />
            <EasterEggMessage show={showEasterEgg} />

            <div className="text-center animate-fade-in-up px-6 relative z-10 max-w-2xl">
                <NotFoundDisplay
                    theme={currentTheme}
                    isHovering={isHovering}
                    setIsHovering={setIsHovering}
                    createFireworks={createFireworks}
                />
                <MessageSection theme={currentTheme} />
                <ActionButtons
                    theme={currentTheme}
                    navigate={navigate}
                    setIsHovering={setIsHovering}
                    createFloatingHearts={createFloatingHearts}
                    toggleMusic={toggleMusic}
                    isMusicPlaying={isMusicPlaying}
                    cycleTheme={cycleTheme}
                    createFireworks={createFireworks}
                />
                <DecorativeElements theme={currentTheme} />
                <InteractiveHint />
            </div>
        </div>
    );
};

export default React.memo(NotFoundPage);
