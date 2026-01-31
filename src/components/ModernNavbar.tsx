import {
	memo,
	useState,
	useEffect,
	useCallback,
	useRef,
	useMemo,
	type ElementType,
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
} from 'react';
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
	useScrollTrigger,
	Zoom,
} from '@mui/material';
import {
	Home,
	Person,
	Code,
	Work,
	Science,
	School,
	ContactMail,
} from '@mui/icons-material';
import { useSystemProfile } from './useSystemProfile';
import { gsap } from 'gsap';
import StarBorder from './StarBorder';
import GlassSurface from './GlassSurface';
import { useLenis } from '../hooks/useLenis';

const MotionBox = motion(Box);

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
	{ name: 'Tech', href: '#technologies', icon: Code },
	{ name: 'Experience', href: '#experience', icon: Work },
	{ name: 'Research', href: '#research', icon: Science },
	{ name: 'Projects', href: '#projects', icon: School },
	{ name: 'Certificates', href: '#certifications', icon: School },
	{ name: 'Contact', href: '#contact', icon: ContactMail },
];

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
	const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [navbarReady, setNavbarReady] = useState(() => typeof window === 'undefined');

	const navRef = useRef<HTMLDivElement | null>(null);
	const logoBoxRef = useRef<HTMLDivElement | null>(null);
	const desktopNavRef = useRef<HTMLDivElement | null>(null);
	const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
	const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
	const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
	const activeSectionRef = useRef('hero');
	const evaluationFrameRef = useRef<number | null>(null);
	const evaluationScrollRef = useRef(0);
	const reducedEvaluationFrameRef = useRef<number | null>(null);
	const reducedEvaluationScrollRef = useRef(0);

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
	const fabMagnifyMouseX = useMotionValue(Number.POSITIVE_INFINITY);

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
	const sharedMagnifySpring = useMemo<SpringOptions>(() => ({ stiffness: 280, damping: 26, mass: 0.42 }), []);

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

	// GSAP Pill Animation Setup
	useEffect(() => {
		if (shouldReduceMotion || prefersLightweightMenu) return;

		const layoutPills = () => {
			circleRefs.current.forEach((circle, index) => {
				if (!circle?.parentElement) return;

				const pill = circle.parentElement as HTMLElement;
				const rect = pill.getBoundingClientRect();
				const { width: w, height: h } = rect;
				
				// Calculate circle dimensions for pill effect
				const R = ((w * w) / 4 + h * h) / (2 * h);
				const D = Math.ceil(2 * R) + 2;
				const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
				const originY = D - delta;

				circle.style.width = `${D}px`;
				circle.style.height = `${D}px`;
				circle.style.bottom = `-${delta}px`;

				gsap.set(circle, {
					xPercent: -50,
					scale: 0,
					transformOrigin: `50% ${originY}px`,
				});

				const label = pill.querySelector<HTMLElement>('.pill-label');
				const labelHover = pill.querySelector<HTMLElement>('.pill-label-hover');

				if (label) gsap.set(label, { y: 0 });
				if (labelHover) {
					gsap.set(labelHover, { y: h + 12, opacity: 0 });
				}

				// Create GPU-accelerated timeline for hover animation
				tlRefs.current[index]?.kill();
				const tl = gsap.timeline({ paused: true });

				tl.to(
					circle,
					{ scale: 1.15, xPercent: -50, duration: 0.5, ease: 'power2.out', overwrite: 'auto', force3D: true },
					0
				);

				if (label) {
					tl.to(label, { y: -(h + 8), duration: 0.5, ease: 'power2.out', overwrite: 'auto', force3D: true }, 0);
				}

				if (labelHover) {
					gsap.set(labelHover, { y: Math.ceil(h + 100), opacity: 0, force3D: true });
					tl.to(labelHover, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto', force3D: true }, 0);
				}

				tlRefs.current[index] = tl;
			});
		};

		layoutPills();

		const handleResize = () => layoutPills();
		window.addEventListener('resize', handleResize);

		if (document.fonts) {
			document.fonts.ready.then(layoutPills).catch(() => {});
		}

		// Dramatic Enterprise-Level Initial Load Animation
		if (!hasInitialLoaded) {
			const logo = logoBoxRef.current;
			const navContainer = desktopNavRef.current;

			if (logo) {
				gsap.fromTo(
					logo,
					{ opacity: 0, y: -18, filter: 'blur(8px)', force3D: true },
					{
						opacity: 1,
						y: 0,
						filter: 'blur(0px)',
						duration: 0.9,
						ease: 'expo.out',
						force3D: true,
					},
				);
			}

			if (navContainer) {
				const pillElements = Array.from(
					navContainer.querySelectorAll<HTMLElement>('[data-nav-item]'),
				);

				gsap.fromTo(
					navContainer,
					{ opacity: 0, y: 24, filter: 'blur(12px)', force3D: true },
					{
						opacity: 1,
						y: 0,
						filter: 'blur(0px)',
						duration: 1,
						ease: 'expo.out',
						force3D: true,
					},
				);

				if (pillElements.length > 0) {
					gsap.fromTo(
						pillElements,
						{ opacity: 0, y: 16, scale: 0.92, force3D: true },
						{
							opacity: 1,
							y: 0,
							scale: 1,
							duration: 0.7,
							ease: 'power3.out',
							stagger: 0.06,
							force3D: true,
						},
					);
				}
			}

			setHasInitialLoaded(true);
		}

		return () => window.removeEventListener('resize', handleResize);
		}, [shouldReduceMotion, prefersLightweightMenu, navItems, hasInitialLoaded]);

	// Pill hover handlers
	const handlePillEnter = useCallback(
		(index: number) => {
			if (shouldReduceMotion || prefersLightweightMenu) return;
			const tl = tlRefs.current[index];
			if (!tl) return;
			activeTweenRefs.current[index]?.kill();
			activeTweenRefs.current[index] = tl.tweenTo(tl.duration(), {
				duration: 0.4,
				ease: 'power2.out',
				overwrite: 'auto',
			});
		},
		[shouldReduceMotion, prefersLightweightMenu]
	);

	const handlePillLeave = useCallback(
		(index: number) => {
			if (shouldReduceMotion || prefersLightweightMenu) return;
			const tl = tlRefs.current[index];
			if (!tl) return;
			activeTweenRefs.current[index]?.kill();
			activeTweenRefs.current[index] = tl.tweenTo(0, {
				duration: 0.3,
				ease: 'power2.out',
				overwrite: 'auto',
			});
		},
		[shouldReduceMotion, prefersLightweightMenu]
	);

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
				<GlassSurface
					width="100%"
					height="auto"
					borderRadius={0}
					brightness={8}
					opacity={0.9}
					blur={14}
					displace={1.6}
					backgroundOpacity={0.12}
					saturation={1.4}
					distortionScale={-140}
					redOffset={2}
					greenOffset={10}
					blueOffset={18}
					mixBlendMode="screen"
					className="navbar-glass-surface"
					style={{
						borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
						boxShadow: trigger
							? '0 4px 24px rgba(0, 0, 0, 0.12)'
							: '0 2px 12px rgba(0, 0, 0, 0.06)',
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
						transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
						style={{ scale: shouldReduceMotion ? 1 : logoScale }}
						whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
						whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
					>
						{magnificationDisabled ? (
							<Box
								ref={logoBoxRef}
								onClick={() => scrollToSection('#hero')}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 2,
									cursor: 'pointer',
								}}
							>
								<Box
									sx={{
										width: 44,
										height: 44,
										borderRadius: '12px',
										background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: '1.25rem',
										fontWeight: 700,
										color: '#ffffff',
										boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
										transition: 'box-shadow 0.2s ease',
										willChange: 'box-shadow',
										'&:hover': {
											boxShadow: '0 6px 20px rgba(30, 64, 175, 0.4)',
										},
									}}
								>
									G
								</Box>
								{!isMobileDevice && (
									<Box>
										<Box
											sx={{
												fontWeight: 700,
												fontSize: '1.125rem',
												color: '#f1f5f9',
												letterSpacing: '-0.02em',
												whiteSpace: 'nowrap',
											}}
										>
											{isTabletDevice ? 'Gading Aditya' : 'Gading Aditya Perdana'}
										</Box>
										<Box sx={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
											{isTabletDevice ? 'AI Engineer' : 'AI Researcher & Engineer'}
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
									onClick={() => scrollToSection('#hero')}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 2,
										cursor: 'pointer',
									}}
								>
									<Box
										sx={{
											width: 44,
											height: 44,
											borderRadius: '12px',
											background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '1.25rem',
											fontWeight: 700,
											color: '#ffffff',
											boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
											transition: 'all 0.3s ease',
											'&:hover': {
												boxShadow: '0 6px 20px rgba(30, 64, 175, 0.4)',
											},
										}}
									>
										G
									</Box>
									{!isMobileDevice && (
										<Box>
											<Box
												sx={{
													fontWeight: 700,
													fontSize: '1.125rem',
													color: '#f1f5f9',
													letterSpacing: '-0.02em',
													whiteSpace: 'nowrap',
												}}
											>
												{isTabletDevice ? 'Gading Aditya' : 'Gading Aditya Perdana'}
											</Box>
											<Box sx={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
												{isTabletDevice ? 'AI Engineer' : 'AI Researcher & Engineer'}
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
							transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
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
										background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.15), rgba(59, 130, 246, 0.12))',
										borderRadius: '11px',
										opacity: springOpacity,
										zIndex: 0,
										boxShadow: '0 0 30px rgba(59, 130, 246, 0.25), 0 0 60px rgba(59, 130, 246, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)',
										border: '1px solid rgba(59, 130, 246, 0.2)',
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
									const isHomeButton = index === 0;
									const isHovered = hoveredIndex === index;

									const handleMouseEnter = () => {
										handlePillEnter(index);
										setHoveredIndex(index);
									};

									const handleMouseLeave = () => {
										handlePillLeave(index);
										setHoveredIndex((prev) => (prev === index ? null : prev));
										if (!magnificationDisabled) {
											navMagnifyMouseX.set(Number.POSITIVE_INFINITY);
										}
									};

									const homeButtonContent = (
										<Box sx={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
											<StarBorder
												as="div"
												color={isActive ? '#60a5fa' : isHovered ? '#93c5fd' : '#3b82f6'}
												speed={isActive ? '3s' : '5s'}
												className="cursor-pointer"
												onClick={() => scrollToSection(item.href)}
												style={{ padding: 0, margin: 0, display: 'block' }}
											>
												<Box
													sx={{
														display: 'inline-flex',
														alignItems: 'center',
														gap: 0.75,
														px: 1.75,
														py: 0.75,
														height: 40,
														background: isActive
															? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(37, 99, 235, 0.9) 100%)'
															: isHovered
																? 'rgba(59, 130, 246, 0.12)'
																: 'rgba(15, 23, 42, 0.6)',
														borderRadius: '10px',
														border: 'none',
														boxShadow: isActive 
															? '0 2px 8px rgba(30, 64, 175, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)' 
															: isHovered 
																? '0 1px 4px rgba(59, 130, 246, 0.1)' 
																: 'none',
														transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
													}}
												>
													<Icon
														sx={{
															fontSize: '1.125rem',
															color: isActive ? '#ffffff' : isHovered ? '#60a5fa' : '#94a3b8',
															transition: 'color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
														}}
													/>
													<Box
														component="span"
														sx={{
															fontSize: '0.875rem',
															fontWeight: isActive ? 600 : 500,
															color: isActive ? '#ffffff' : isHovered ? '#60a5fa' : '#cbd5e1',
															lineHeight: 1,
															transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
														}}
													>
														{item.name}
													</Box>
												</Box>
											</StarBorder>
										</Box>
									);

									const regularButtonContent = (
										<Box
											sx={{
												position: 'relative',
												overflow: 'hidden',
												display: 'inline-flex',
												alignItems: 'center',
												justifyContent: 'center',
												px: 1.75,
												height: 40,
												borderRadius: '10px',
												cursor: 'pointer',
												border: isActive
													? '1px solid rgba(96, 165, 250, 0.35)'
													: isHovered
														? '1px solid rgba(59, 130, 246, 0.2)'
														: '1px solid rgba(148, 163, 184, 0.12)',
												backgroundColor: isActive
													? 'transparent'
													: isHovered
														? 'rgba(59, 130, 246, 0.06)'
														: 'transparent',
												background: isActive
													? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(37, 99, 235, 0.9) 100%)'
													: isHovered
														? 'rgba(59, 130, 246, 0.06)'
														: 'transparent',
												boxShadow: isActive 
													? '0 2px 8px rgba(30, 64, 175, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)' 
													: isHovered 
														? '0 1px 4px rgba(59, 130, 246, 0.08)' 
														: 'none',
												transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
											}}
										>
											<Box
												component="span"
												ref={(el) => {
													if (el instanceof HTMLSpanElement) {
														circleRefs.current[index] = el;
													}
												}}
												sx={{
													position: 'absolute',
													left: '50%',
													bottom: 0,
													borderRadius: '50%',
													background: isHovered ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.15)',
													pointerEvents: 'none',
													zIndex: 1,
											}}
											/>

											<Box
												sx={{
													position: 'relative',
													display: 'inline-flex',
													alignItems: 'center',
													gap: 0.5,
													zIndex: 2,
											}}
											>
												<Icon sx={{ 
													fontSize: '1.125rem', 
													color: isActive ? '#ffffff' : isHovered ? '#60a5fa' : '#94a3b8', 
													transition: 'color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
												}} />
												<Box
													component="span"
													className="pill-label"
													sx={{
														fontSize: '0.875rem',
														fontWeight: isActive ? 600 : 500,
														color: isActive ? '#ffffff' : isHovered ? '#60a5fa' : '#cbd5e1',
														lineHeight: 1,
														transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
													}}
												>
													{item.name}
												</Box>
												<Box
													component="span"
													className="pill-label-hover"
													sx={{
														position: 'absolute',
														left: '20px',
														top: 0,
														fontSize: '0.875rem',
														fontWeight: 500,
														color: isActive ? '#ffffff' : '#60a5fa',
														lineHeight: 1,
														pointerEvents: 'none',
													}}
												>
													{item.name}
												</Box>
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
														background: '#60a5fa',
														boxShadow: '0 0 6px rgba(96, 165, 250, 0.5)',
														zIndex: 4,
													}}
												/>
											)}
										</Box>
									);

									const content = isHomeButton ? homeButtonContent : regularButtonContent;

									if (magnificationDisabled) {
										return (
											<Box
												key={item.name}
												data-nav-item={sectionKey}
												onMouseEnter={handleMouseEnter}
												onMouseLeave={handleMouseLeave}
												onClick={() => scrollToSection(item.href)}
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
											magnification={isHomeButton ? 1.22 : 1.16}
											distance={190}
											spring={sharedMagnifySpring}
											onPointerEnter={handleMouseEnter}
											onPointerLeave={handleMouseLeave}
											onClick={() => scrollToSection(item.href)}
											style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
										>
											{content}
										</MagnifiedInteractive>
									);
								})}
							</Box>
						</motion.div>
					)}

				</Toolbar>

				{/* Progress bar */}
				<motion.div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: 2,
						background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
						transformOrigin: 'left',
						scaleX: shouldReduceMotion ? 0 : scrollYProgress,
						opacity: 0.8,
					}}
				/>
				</GlassSurface>
			</AppBar>
			
			{/* StaggeredMenu for mobile/tablet */}
			{navbarReady && (isMobileDevice || isTabletDevice) && (
				<StaggeredMenu
					position="right"
					colors={['#1e40af', '#3b82f6']}
					items={navItems.map((item) => ({
						label: item.name,
						ariaLabel: `Navigate to ${item.name}`,
						link: item.href,
					}))}
					displaySocials={false}
					displayItemNumbering={false}
					menuButtonColor="#e2e8f0"
					openMenuButtonColor="#ffffff"
					accentColor="#3b82f6"
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
		</>
	);
};

const ModernNavbar = memo(ModernNavbarComponent);
ModernNavbar.displayName = 'ModernNavbar';

export default ModernNavbar;