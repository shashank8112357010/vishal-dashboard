import { useMemo } from "react";
import MotionViewport from "@/components/animate/motion-viewport";
import { getVariant } from "@/components/animate/variants";
import { themeVars } from "@/theme/theme.css";
import { Card } from "@/ui/card";

type Props = {
	variant: string;
};
export default function ContainerView({ variant }: Props) {
	const varients = useMemo(() => getVariant(variant), [variant]);

	return (
		<div
			key={variant}
			className="h-[480px] overflow-auto rounded-lg px-20"
			style={{ backgroundColor: themeVars.colors.background.neutral }}
		>
			{[...Array(40)].map((_, index) => (
				// @ts-expect-error - Template animation variant type issue
				// biome-ignore lint/suspicious/noArrayIndexKey: Demo component
				<MotionViewport key={index} variants={varients} className="mt-4">
					<Card>
						<span className="text-center">Item {index + 1}</span>
					</Card>
				</MotionViewport>
			))}
		</div>
	);
}
