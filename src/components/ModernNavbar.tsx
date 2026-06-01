import {
	memo,
	useState,
	useEffect,
	useCallback,
	useRef,
	useMemo,
	type ElementType,
	type PointerEvent as ReactPointerEvent,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import {
	motion,
	useScroll,
	useTransform,
	useSpring,
	useMotionValue,
	type MotionValue,
	type SpringOptions,
	type MotionStyle,
} from 'framer-motion';
import {
	AppBar,
	Toolbar,
	Fab,
	Box,
	IconButton,
	useScrollTrigger,
	Zoom,
} from '@mui/material';
import { useColorScheme, useTheme, alpha } from '@mui/material/styles';
import {
	Home,
	Person,
	Work,
	Science,
	School,
	ContactMail,
	KeyboardArrowUp,
	LightMode,
	DarkMode,
} from '@mui/icons-material';
import { useSystemProfile } from './useSystemProfile';
import { useLenis } from '../hooks/useLenis';

type MagnifiedInteractiveProps = {
	children: ReactNode;
	mouseX: MotionValue<number>;
	baseScale?: number;
	magnification?: number;
	distance?: number;
	spring?: SpringOptions;
	style?: MotionStyle;
	onPointerEnter?: (event: ReactPointerEvent<HTMLDivElement>) => void;
	onPointerLeave?: (event: ReactPointerEvent<HTMLDivElement>) => void;
	onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
} & Record<string, unknown>;

const defaultMagnifySpring: SpringOptions = { stiffness: 260, damping: 24, mass: 0.4 };

const MagnifiedInteractive = ({
	children,
	mouseX,
	baseScale = 1,
	magnification = 5,
	distance = 300,
	spring,
	style,
	onPointerEnter,
	onPointerLeave,
	onPointerMove,
	...rest
}: MagnifiedInteractiveProps) => {
	const itemRef = useRef<HTMLDivElement | null>(null);
	const springConfig = useMemo(() => spring ?? defaultMagnifySpring, [spring]);
	const handlePointerMove = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			mouseX.set(event.clientX);
			onPointerMove?.(event);
		},
		[mouseX, onPointerMove],
	);
	const handlePointerLeave = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			mouseX.set(Number.POSITIVE_INFINITY);
			onPointerLeave?.(event);
		},
		[mouseX, onPointerLeave],
	);
	const handlePointerEnter = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			onPointerEnter?.(event);
		},
		[onPointerEnter],
	);
	const pointerHandlers = useMemo(
		() => ({
			onPointerEnter: handlePointerEnter,
			onPointerLeave: handlePointerLeave,
			onPointerMove: handlePointerMove,
		}),
		[handlePointerEnter, handlePointerLeave, handlePointerMove],
	);

	const pointerDelta = useTransform(mouseX, (value) => {
		if (!itemRef.current || !Number.isFinite(value)) {
			return distance * 2;
		}

		const rect = itemRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		return value - centerX;
	});

	const targetScale = useTransform(pointerDelta, [-distance, 0, distance], [baseScale, magnification, baseScale]);
	const scale = useSpring(targetScale, springConfig);

	return (
		<motion.div
			ref={itemRef}
			{...(pointerHandlers as Record<string, unknown>)}
			style={{
				display: 'inline-flex',
				flexShrink: 0,
				willChange: 'transform',
				...style,
				scale,
			}}
			{...rest}
		>
			{children}
		</motion.div>
	);
};

import './ModernNavbar.css';
import { StaggeredMenu } from './StaggeredMenu';
import LiquidGlass from './LiquidGlass';
import GlassFilters from './GlassFilters';

type NavItem = {
	name: string;
	href: string;
	icon: ElementType;
};

type NavItemPosition = {
	x: number;
	width: number;
	height: number;
};

// Static nav items - defined outside component to avoid recreation
const NAV_ITEMS: NavItem[] = [
	{ name: 'Home', href: '#hero', icon: Home },
	{ name: 'About', href: '#about', icon: Person },
	{ name: 'Research', href: '#research', icon: Science },
	{ name: 'Projects', href: '#projects', icon: School },
	{ name: 'Experience', href: '#experience', icon: Work },
	{ name: 'Contact', href: '#contact', icon: ContactMail },
];

// Shared sizing for the top-right control cluster (theme toggle + mobile menu button).
const CTRL_SIZE = 44; // px — equal-sized, >=44px touch target

type NavItemPositions = Record<string, NavItemPosition>;

type InterpolationDatum = {
	section: string;
	visibilityRatio: number;
	index: number;
};

type LenisScrollEvent = {
	scroll: number;
	limit: number;
	velocity: number;
	direction: number;
	progress: number;
};

const ModernNavbarComponent = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState('hero');
	const [navItemPositions, setNavItemPositions] = useState<NavItemPositions>({});
	const [isMobileCSS, setIsMobileCSS] = useState(false);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [navbarReady, setNavbarReady] = useState(() => typeof window === 'undefined');

	const navRef = useRef<HTMLDivElement | null>(null);
	const logoBoxRef = useRef<HTMLDivElement | null>(null);
	const desktopNavRef = useRef<HTMLDivElement | null>(null);
	const activeSectionRef = useRef('hero');
	const evaluationFrameRef = useRef<number | null>(null);
	const evaluationScrollRef = useRef(0);
	const reducedEvaluationFrameRef = useRef<number | null>(null);
	const reducedEvaluationScrollRef = useRef(0);

	const { mode, systemMode, setMode } = useColorScheme();
	const theme = useTheme();
	// Resolve the ACTIVE scheme's palette so colors adapt to the in-app toggle.
	// theme.palette is locked to the default scheme and would break light mode.
	const resolvedMode: 'light' | 'dark' =
		(mode === 'system' ? systemMode : mode) === 'light' ? 'light' : 'dark';
	const pal =
		(theme as unknown as { colorSchemes?: Record<'light' | 'dark', { palette: typeof theme.palette }> })
			.colorSchemes?.[resolvedMode]?.palette ?? theme.palette;
	const toggleColorScheme = useCallback(
		(event?: ReactMouseEvent) => {
			const next = resolvedMode === 'dark' ? 'light' : 'dark';
			const vtDoc = document as Document & { startViewTransition?: (cb: () => void) => void };
			const reduce =
				typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (!vtDoc.startViewTransition || reduce) {
				setMode(next);
				return;
			}
			// Circular reveal of the new theme, centered on the toggle button.
			const x = event?.clientX ?? window.innerWidth - 48;
			const y = event?.clientY ?? 48;
			const root = document.documentElement;
			root.style.setProperty('--vt-x', `${x}px`);
			root.style.setProperty('--vt-y', `${y}px`);
			root.style.setProperty(
				'--vt-r',
				`${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`,
			);
			vtDoc.startViewTransition(() => {
				flushSync(() => setMode(next));
			});
		},
		[resolvedMode, setMode],
	);

	const { lenis } = useLenis();
	const getScrollPosition = useCallback(() => {
		if (lenis) {
			const { scroll } = (lenis as unknown as { scroll?: number });
			if (typeof scroll === 'number') {
				return scroll;
			}
		}
		return typeof window !== 'undefined' ? window.scrollY : 0;
	}, [lenis]);

	const { performanceTier, deviceType } = useSystemProfile();

	const liquidX = useMotionValue(0);
	const liquidWidth = useMotionValue(0);
	const liquidOpacity = useMotionValue(0);
	const navMagnifyMouseX = useMotionValue(Number.POSITIVE_INFINITY);
	const brandMagnifyMouseX = useMotionValue(Number.POSITIVE_INFINITY);

	const springX = useSpring(liquidX, {
		stiffness: 260,
		damping: 32,
		mass: 0.7,
	});
	const springWidth = useSpring(liquidWidth, {
		stiffness: 240,
		damping: 36,
		mass: 0.8,
	});
	const springOpacity = useSpring(liquidOpacity, {
		stiffness: 350,
		damping: 38,
	});

	const { scrollY, scrollYProgress } = useScroll({ layoutEffect: false });
	const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 50 });

	const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

	const isMobile = deviceType === 'mobile';
	const isTablet = deviceType === 'tablet';
	const shouldReduceMotion = performanceTier === 'low';
	const sharedMagnifySpring = useMemo<SpringOptions>(() => ({ stiffness: 320, damping: 28, mass: 0.35 }), []);

	useEffect(() => {
		activeSectionRef.current = activeSection;
	}, [activeSection]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const raf = window.requestAnimationFrame(() => setNavbarReady(true));
		return () => window.cancelAnimationFrame(raf);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const checkMobile = () => {
			setIsMobileCSS(
				window.innerWidth <= 768 ||
					window.matchMedia('(pointer: coarse)').matches,
			);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	}, []);

	const windowWidth = typeof window !== 'undefined' ? window.innerWidth : undefined;
	const isMobileDevice = isMobile || isMobileCSS;
	const isTabletDevice =
		isTablet ||
		(windowWidth !== undefined &&
			windowWidth > 768 &&
			windowWidth < 1024 &&
			(isMobile || isMobileCSS));

	const magnificationDisabled = shouldReduceMotion;
	const prefersLightweightMenu = isTabletDevice || shouldReduceMotion;

	// Use constant nav items
	const navItems = NAV_ITEMS;

	const scrollToSection = useCallback(
		(sectionId: string) => {
			if (typeof document === 'undefined') {
				return;
			}

			const target = document.querySelector(sectionId);
			if (!(target instanceof HTMLElement)) {
				return;
			}

			const targetSection = sectionId.replace('#', '');

			if (lenis) {
				lenis.scrollTo(target, {
					duration: shouldReduceMotion ? 0 : 1,
					offset: 0,
					immediate: shouldReduceMotion,
				});
			} else {
				target.scrollIntoView({
					behavior: shouldReduceMotion ? 'auto' : 'smooth',
					block: 'start',
				});
			}

			setActiveSection(targetSection);
			activeSectionRef.current = targetSection;
			setIsMenuOpen(false);
		},
		[lenis, shouldReduceMotion],
	);

	const updateLiquidIndicator = useCallback(
		(interpolationData: InterpolationDatum[], primarySection: string) => {
			if (shouldReduceMotion) {
				return;
			}

			const primaryPosition = navItemPositions[primarySection];
			if (!primaryPosition) {
				return;
			}

			const sortedData = interpolationData
				.filter((data) => data.visibilityRatio > 0)
				.sort((a, b) => b.visibilityRatio - a.visibilityRatio)
				.slice(0, 2);

			if (sortedData.length === 0) {
				return;
			}

			const [primary, secondary] = sortedData;

			let targetX = primaryPosition.x;
			let targetWidth = primaryPosition.width;

			if (secondary && secondary.visibilityRatio > 0.1) {
				const secondaryPosition = navItemPositions[secondary.section];

				if (secondaryPosition) {
					const interpolationStrength =
						secondary.visibilityRatio /
						(primary.visibilityRatio + secondary.visibilityRatio);

					const easedInterpolation = 1 - Math.pow(1 - interpolationStrength, 3);

					if (secondary.index > primary.index) {
						targetX =
							primaryPosition.x +
							(secondaryPosition.x - primaryPosition.x) * easedInterpolation * 0.3;
						targetWidth =
							primaryPosition.width +
							(secondaryPosition.width - primaryPosition.width +
								Math.abs(secondaryPosition.x - primaryPosition.x) * 0.5) *
								easedInterpolation;
					} else {
						targetX =
							secondaryPosition.x +
							(primaryPosition.x - secondaryPosition.x) * (1 - easedInterpolation * 0.3);
						targetWidth =
							secondaryPosition.width +
							(primaryPosition.width - secondaryPosition.width +
								Math.abs(primaryPosition.x - secondaryPosition.x) * 0.5) *
								(1 - easedInterpolation);
					}
				}
			}

			liquidX.set(targetX);
			liquidWidth.set(Math.max(targetWidth, 60));
			liquidOpacity.set(1);
		},
		[liquidOpacity, liquidWidth, liquidX, navItemPositions, shouldReduceMotion],
	);

	useEffect(() => {
		if (shouldReduceMotion || typeof document === 'undefined' || typeof window === 'undefined') {
			return undefined;
		}

		const sections = navItems.map((item) => item.href.replace('#', ''));

		const evaluateSections = (scrollTop: number) => {
			let currentSection = 'hero';
			let maxVisibleArea = 0;
			const interpolationData: InterpolationDatum[] = [];
			const viewportHeight = window.innerHeight;

			sections.forEach((section, index) => {
				const element = document.getElementById(section);
				if (!element) {
					return;
				}

				const { offsetTop, offsetHeight } = element;
				const visibleTop = Math.max(scrollTop, offsetTop);
				const visibleBottom = Math.min(scrollTop + viewportHeight, offsetTop + offsetHeight);
				const visibleHeight = Math.max(0, visibleBottom - visibleTop);
				const visibilityRatio = visibleHeight / Math.min(offsetHeight, viewportHeight);

				interpolationData.push({ section, visibilityRatio, index });

				if (visibilityRatio > maxVisibleArea) {
					maxVisibleArea = visibilityRatio;
					currentSection = section;
				}
			});

			if (currentSection !== activeSectionRef.current) {
				activeSectionRef.current = currentSection;
				setActiveSection(currentSection);
			}

			updateLiquidIndicator(interpolationData, currentSection);
		};

		const scheduleEvaluation = (scrollTop: number) => {
			evaluationScrollRef.current = scrollTop;
			if (evaluationFrameRef.current !== null) {
				return;
			}
			evaluationFrameRef.current = requestAnimationFrame(() => {
				evaluationFrameRef.current = null;
				evaluateSections(evaluationScrollRef.current);
			});
		};

		if (lenis) {
			const handleLenisScroll = ({ scroll }: LenisScrollEvent) => {
				scheduleEvaluation(typeof scroll === 'number' ? scroll : getScrollPosition());
			};
			lenis.on('scroll', handleLenisScroll);
			scheduleEvaluation(getScrollPosition());
			return () => {
				lenis.off('scroll', handleLenisScroll);
				if (evaluationFrameRef.current !== null) {
					cancelAnimationFrame(evaluationFrameRef.current);
					evaluationFrameRef.current = null;
				}
			};
		}

		const handleWindowScroll = () => scheduleEvaluation(getScrollPosition());
		window.addEventListener('scroll', handleWindowScroll, { passive: true });
		scheduleEvaluation(getScrollPosition());

		return () => {
			window.removeEventListener('scroll', handleWindowScroll);
			if (evaluationFrameRef.current !== null) {
				cancelAnimationFrame(evaluationFrameRef.current);
				evaluationFrameRef.current = null;
			}
		};
	}, [getScrollPosition, lenis, navItems, shouldReduceMotion, updateLiquidIndicator]);

	useEffect(() => {
		if (!shouldReduceMotion || typeof document === 'undefined' || typeof window === 'undefined') {
			return undefined;
		}

		const sections = navItems.map((item) => item.href.replace('#', ''));

		const updateSection = (scrollTop: number) => {
			const scrollPosition = scrollTop + 100;

			for (const section of sections) {
				const element = document.getElementById(section);
				if (!element) {
					continue;
				}

				const { offsetTop, offsetHeight } = element;
				if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
					if (section !== activeSectionRef.current) {
						activeSectionRef.current = section;
						setActiveSection(section);
					}
					break;
				}
			}
		};

		const scheduleUpdate = (scrollTop: number) => {
			reducedEvaluationScrollRef.current = scrollTop;
			if (reducedEvaluationFrameRef.current !== null) {
				return;
			}
			reducedEvaluationFrameRef.current = requestAnimationFrame(() => {
				reducedEvaluationFrameRef.current = null;
				updateSection(reducedEvaluationScrollRef.current);
			});
		};

		if (lenis) {
			const handleLenisScroll = ({ scroll }: LenisScrollEvent) => {
				scheduleUpdate(typeof scroll === 'number' ? scroll : getScrollPosition());
			};
			lenis.on('scroll', handleLenisScroll);
			scheduleUpdate(getScrollPosition());
			return () => {
				lenis.off('scroll', handleLenisScroll);
				if (reducedEvaluationFrameRef.current !== null) {
					cancelAnimationFrame(reducedEvaluationFrameRef.current);
					reducedEvaluationFrameRef.current = null;
				}
			};
		}

		const handleWindowScroll = () => scheduleUpdate(getScrollPosition());
		window.addEventListener('scroll', handleWindowScroll, { passive: true });
		scheduleUpdate(getScrollPosition());

		return () => {
			window.removeEventListener('scroll', handleWindowScroll);
			if (reducedEvaluationFrameRef.current !== null) {
				cancelAnimationFrame(reducedEvaluationFrameRef.current);
				reducedEvaluationFrameRef.current = null;
			}
		};
	}, [getScrollPosition, lenis, navItems, shouldReduceMotion]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const measurePositions = () => {
			const navElement = navRef.current;

			if (!navElement) {
				return;
			}

			const parentRect = navElement.getBoundingClientRect();
			const navElements = navElement.querySelectorAll<HTMLElement>('[data-nav-item]');
			const positions: NavItemPositions = {};

			navElements.forEach((item) => {
				const section = item.getAttribute('data-nav-item');

				if (!section) {
					return;
				}

				const rect = item.getBoundingClientRect();

				positions[section] = {
					x: rect.left - parentRect.left,
					width: rect.width,
					height: rect.height,
				};
			});

			setNavItemPositions(positions);
		};

		measurePositions();
		window.addEventListener('resize', measurePositions);

		const timer = window.setTimeout(measurePositions, 100);

		return () => {
			window.removeEventListener('resize', measurePositions);
			window.clearTimeout(timer);
		};
	}, [navItems, prefersLightweightMenu, shouldReduceMotion]);

	return (
		<>
			<GlassFilters />
			<AppBar
				position="fixed"
				elevation={0}
				id="main-navbar"
				component="nav"
				aria-label="Main navigation"
				sx={{
					background: 'transparent',
					backdropFilter: 'none',
					WebkitBackdropFilter: 'none',
					borderBottom: 'none',
					zIndex: 1100,
					boxShadow: 'none',
					opacity: navbarReady ? 1 : 0,
					pointerEvents: navbarReady ? 'auto' : 'none',
					transition: 'opacity 0.35s ease',
				}}
			>
				<LiquidGlass
					component="div"
					intensity="bold"
					interactive
					sx={{
						width: '100%',
						borderRadius: 0,
						borderTop: 'none',
						borderLeft: 'none',
						borderRight: 'none',
						borderBottom: '1px solid var(--lg-border)',
						transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
						'--lg-tint': trigger
							? 'color-mix(in srgb, var(--app-palette-bg-elevated) 80%, transparent)'
							: 'color-mix(in srgb, var(--app-palette-bg-elevated) 62%, transparent)',
						'--lg-shadow': trigger
							? '0 8px 24px rgba(0,0,0,0.14)'
							: '0 4px 16px rgba(0,0,0,0.06)',
					}}
				>
				<Toolbar
					sx={{
						justifyContent: 'space-between',
						alignItems: 'center',
						px: { xs: 2, md: 4 },
						py: 0,
						minHeight: { xs: 66, md: 76 },
						overflow: 'visible',
						width: '100%',
						columnGap: { xs: 2, md: 3 },
					}}
				>
					<motion.div
						initial={{ opacity: 0, x: -24, filter: 'blur(4px)' }}
						animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
						transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
						style={{ scale: shouldReduceMotion ? 1 : logoScale }}
						whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
					>
						{magnificationDisabled ? (
							<Box
								ref={logoBoxRef}
								component="a"
								href="#hero"
								aria-label="Back to top"
								onClick={(event) => {
									event.preventDefault();
									scrollToSection('#hero');
								}}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 2,
									cursor: 'pointer',
									textDecoration: 'none',
									color: 'inherit',
									'&:focus-visible': {
										outline: `2px solid ${pal.primary.main}`,
										outlineOffset: 3,
										borderRadius: 12,
									},
								}}
							>
								<Box
									className="glass-sheen glass-sheen--interactive"
									sx={{
										width: 44,
										height: 44,
										borderRadius: '12px',
										background: `linear-gradient(135deg, ${pal.primary.dark} 0%, ${pal.primary.main} 100%)`,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: '1.25rem',
										fontWeight: 700,
										color: pal.primary.contrastText,
										boxShadow: `0 4px 12px ${alpha(pal.primary.main, 0.3)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
										transition: 'box-shadow 0.2s ease',
										willChange: 'box-shadow',
										'&:hover': {
											boxShadow: `0 6px 20px ${alpha(pal.primary.main, 0.4)}, inset 0 1px 0 rgba(255,255,255,0.45)`,
										},
									}}
								>
									<span>G</span>
								</Box>
								{!isMobileDevice && (
									<Box>
										<Box
											sx={{
												fontWeight: 700,
												fontSize: '1.125rem',
												color: pal.text.primary,
												letterSpacing: '-0.02em',
												whiteSpace: 'nowrap',
											}}
										>
											{isTabletDevice ? 'Gading Aditya' : 'Gading Aditya Perdana'}
										</Box>
										<Box sx={{ fontSize: '0.8125rem', fontFamily: '"DM Sans", sans-serif', color: pal.text.secondary, fontWeight: 500, whiteSpace: 'nowrap' }}>
											{isTabletDevice ? 'AI Researcher' : 'AI Researcher & Developer'}
										</Box>
									</Box>
								)}
							</Box>
						) : (
							<MagnifiedInteractive
								mouseX={brandMagnifyMouseX}
								magnification={1.12}
								distance={150}
								spring={sharedMagnifySpring}
								style={{ alignItems: 'center' }}
							>
								<Box
									ref={logoBoxRef}
									component="a"
									href="#hero"
									aria-label="Back to top"
									onClick={(event) => {
										event.preventDefault();
										scrollToSection('#hero');
									}}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 2,
										cursor: 'pointer',
									textDecoration: 'none',
									color: 'inherit',
									'&:focus-visible': {
										outline: `2px solid ${pal.primary.main}`,
										outlineOffset: 3,
										borderRadius: 12,
									},
									}}
								>
									<Box
										className="glass-sheen glass-sheen--interactive"
										sx={{
											width: 44,
											height: 44,
											borderRadius: '12px',
											background: `linear-gradient(135deg, ${pal.primary.dark} 0%, ${pal.primary.main} 100%)`,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '1.25rem',
											fontFamily: '"Sora", sans-serif',
											fontWeight: 700,
											color: pal.primary.contrastText,
											boxShadow: `0 4px 12px ${alpha(pal.primary.main, 0.3)}, inset 0 1px 0 rgba(255,255,255,0.4)`,
											transition: 'all 0.3s ease',
											'&:hover': {
												boxShadow: `0 6px 20px ${alpha(pal.primary.main, 0.4)}, inset 0 1px 0 rgba(255,255,255,0.45)`,
											},
										}}
									>
										<span>G</span>
									</Box>
									{!isMobileDevice && (
										<Box>
											<Box
												sx={{
													fontWeight: 700,
													fontSize: '1.125rem',
													fontFamily: '"Sora", sans-serif',
													color: pal.text.primary,
													letterSpacing: '-0.02em',
													whiteSpace: 'nowrap',
												}}
											>
												{isTabletDevice ? 'Gading Aditya' : 'Gading Aditya Perdana'}
											</Box>
											<Box sx={{ fontSize: '0.8125rem', fontFamily: '"DM Sans", sans-serif', color: pal.text.secondary, fontWeight: 500, whiteSpace: 'nowrap' }}>
												{isTabletDevice ? 'AI Researcher' : 'AI Researcher & Developer'}
											</Box>
										</Box>
									)}
								</Box>
							</MagnifiedInteractive>
						)}
					</motion.div>

					{!isMobileDevice && !isTabletDevice && (
						<motion.div
							ref={desktopNavRef}
							initial={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
							animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
							style={{ position: 'relative', overflow: 'visible' }}
						>
							{!shouldReduceMotion && (
								<motion.div
									style={{
										position: 'absolute',
										top: '50%',
										left: springX,
										width: springWidth,
										height: '42px',
										transform: 'translateY(-50%)',
										background: `linear-gradient(135deg, ${alpha(pal.primary.main, 0.16)}, ${alpha(pal.secondary.main, 0.12)})`,
										borderRadius: '11px',
										opacity: springOpacity,
										zIndex: 0,
										boxShadow: `0 0 16px ${alpha(pal.primary.main, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
										border: `1px solid ${alpha(pal.primary.main, 0.22)}`,
									}}
									transition={{ type: 'spring', stiffness: 260, damping: 32 }}
								/>
							)}

							<Box 
								ref={navRef}
								onMouseMove={magnificationDisabled ? undefined : (event) => navMagnifyMouseX.set(event.clientX)}
								onMouseLeave={magnificationDisabled ? undefined : () => navMagnifyMouseX.set(Number.POSITIVE_INFINITY)}
								sx={{ display: 'flex', gap: 0.75, position: 'relative', zIndex: 1, overflow: 'visible' }}
							>
								{navItems.map((item, index) => {
									const sectionKey = item.href.replace('#', '');
									const isActive = activeSection === sectionKey;
									const Icon = item.icon;
									const isHovered = hoveredIndex === index;

									const handleMouseEnter = () => {
										setHoveredIndex(index);
									};

									const handleMouseLeave = () => {
										setHoveredIndex(null);
									};

									const content = (
										<Box
											component="a"
											className="nav-btn"
											href={item.href}
											onClick={(event) => {
												event.preventDefault();
												scrollToSection(item.href);
											}}
											aria-current={isActive ? 'page' : undefined}
											sx={{
												position: 'relative',
												overflow: 'visible',
												display: 'inline-flex',
												alignItems: 'center',
												justifyContent: 'center',
												gap: 0.5,
												px: 1.75,
												height: 40,
												borderRadius: '10px',
												cursor: 'pointer',
												textDecoration: 'none',
												border: isHovered
													? `1px solid ${alpha(pal.primary.main, 0.18)}`
													: `1px solid ${alpha(pal.divider, 0.6)}`,
												background: isHovered
													? `color-mix(in srgb, var(--app-palette-primary-main) 10%, transparent)`
													: 'transparent',
												boxShadow: isHovered
													? `0 1px 6px ${alpha(pal.primary.main, 0.14)}, inset 0 1px 0 rgba(255,255,255,0.30)`
													: 'none',
												transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
												'&::after': {
													content: '""',
													position: 'absolute',
													bottom: 0,
													left: '20%',
													width: '60%',
													height: '2px',
													borderRadius: '1px',
													background: `linear-gradient(90deg, ${alpha(pal.primary.main, 0.85)}, ${alpha(pal.primary.light, 0.85)})`,
													transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
													transformOrigin: 'center',
													transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
												},
												'&:focus-visible': {
													outline: `2px solid ${pal.primary.main}`,
													outlineOffset: 2,
												},
											}}
										>
											<Icon sx={{
													fontSize: '1rem',
													color: isActive ? pal.text.primary : isHovered ? pal.primary.main : pal.text.secondary,
													transition: 'color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
												}} />
											<Box
													component="span"
													sx={{
														fontSize: '0.8125rem',
														fontFamily: '"DM Sans", sans-serif',
														fontWeight: isActive ? 600 : 500,
														color: isActive ? pal.text.primary : isHovered ? pal.primary.main : pal.text.secondary,
														lineHeight: 1,
														letterSpacing: '0.01em',
														transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
													}}
												>
													{item.name}
												</Box>

												{isActive && (
													<Box
														sx={{
															position: 'absolute',
															left: '50%',
															bottom: -6,
															transform: 'translateX(-50%)',
															width: 4,
															height: 4,
															borderRadius: '50%',
															background: pal.primary.main,
															boxShadow: `0 0 8px ${alpha(pal.primary.main, 0.5)}`,
															zIndex: 4,
														}}
													/>
												)}
											</Box>
									);

									if (magnificationDisabled) {
										return (
											<Box
												key={item.name}
												data-nav-item={sectionKey}
												onMouseEnter={handleMouseEnter}
												onMouseLeave={handleMouseLeave}
												sx={{
													position: 'relative',
													display: 'inline-flex',
													alignItems: 'center',
													justifyContent: 'center',
													overflow: 'visible',
												}}
											>
												{content}
											</Box>
										);
									}

									return (
										<MagnifiedInteractive
											key={item.name}
											data-nav-item={sectionKey}
											mouseX={navMagnifyMouseX}
											magnification={1.10}
											distance={150}
											spring={sharedMagnifySpring}
											onPointerEnter={handleMouseEnter}
											onPointerLeave={handleMouseLeave}
											style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
										>
											{content}
										</MagnifiedInteractive>
									);
								})}
							</Box>
						</motion.div>
					)}

					<motion.div
						initial={{ opacity: 0, scale: 0.85 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
						style={{
							display: 'inline-flex',
							marginRight: (isMobileDevice || isTabletDevice) ? 48 : 0,
						}}
					>
						<LiquidGlass
							component="div"
							intensity="bold"
							interactive
							radius={12}
							sx={{ width: CTRL_SIZE, height: CTRL_SIZE, display: 'inline-flex' }}
						>
							<IconButton
								onClick={toggleColorScheme}
								aria-label="Toggle light/dark theme"
								sx={{
									width: '100%',
									height: '100%',
									borderRadius: '12px',
									color: 'text.primary',
									backgroundColor: 'transparent',
									transition: 'color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
									'&:hover': { color: 'primary.light', backgroundColor: 'transparent' },
								}}
							>
								{/* Before hydration `mode` is undefined; render a stable fallback icon
								    (dark = default scheme) to avoid a flash/crash. */}
								{resolvedMode === 'light' ? (
									<DarkMode sx={{ fontSize: '1.25rem' }} />
								) : (
									<LightMode sx={{ fontSize: '1.25rem' }} />
								)}
							</IconButton>
						</LiquidGlass>
					</motion.div>

				</Toolbar>

				{/* Progress bar */}
				<motion.div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: 2,
						background: `linear-gradient(90deg, ${pal.primary.dark} 0%, ${pal.primary.main} 50%, ${pal.primary.light} 100%)`,
						transformOrigin: 'left',
						scaleX: shouldReduceMotion ? 0 : scrollYProgress,
						opacity: 0.8,
					}}
				/>
				</LiquidGlass>
			</AppBar>
			
			{/* StaggeredMenu for mobile/tablet */}
			{navbarReady && (isMobileDevice || isTabletDevice) && (
				<StaggeredMenu
					position="right"
					colors={[pal.primary.dark, pal.primary.main]}
					items={navItems.map((item) => ({
						label: item.name,
						ariaLabel: `Navigate to ${item.name}`,
						link: item.href,
					}))}
					displaySocials={false}
					displayItemNumbering={false}
					menuButtonColor={pal.text.primary}
					openMenuButtonColor={pal.primary.main}
					accentColor={pal.primary.main}
					isFixed={true}
					changeMenuColorOnOpen={true}
					open={isMenuOpen}
					onOpenChange={(open) => setIsMenuOpen(open)}
					onItemClick={(link) => {
						scrollToSection(link);
						setIsMenuOpen(false);
					}}
					zIndex={1350}
					toolbarHeight={isTabletDevice ? 76 : 66}
					toolbarPadding={isTabletDevice ? 32 : 16}
				/>
			)}

			{/* Scroll to top FAB for mobile/tablet */}
			{(isMobileDevice || isTabletDevice) && (
				<Zoom in={trigger}>
					<Fab
						onClick={() => scrollToSection('#hero')}
						size="medium"
						aria-label="Scroll to top"
						sx={{
							position: 'fixed',
							bottom: 24,
							left: 24,
							zIndex: 1200,
							background: `linear-gradient(135deg, ${pal.primary.dark} 0%, ${pal.primary.main} 100%)`,
							color: pal.primary.contrastText,
							boxShadow: `0 4px 20px ${alpha(pal.primary.main, 0.35)}`,
							'&:hover': {
								background: `linear-gradient(135deg, ${pal.primary.main} 0%, ${pal.primary.light} 100%)`,
								boxShadow: `0 6px 24px ${alpha(pal.primary.main, 0.45)}`,
							},
							'&:active': {
								transform: 'scale(0.95)',
							},
						}}
					>
						<KeyboardArrowUp />
					</Fab>
				</Zoom>
			)}
		</>
	);
};

const ModernNavbar = memo(ModernNavbarComponent);
ModernNavbar.displayName = 'ModernNavbar';

export default ModernNavbar;