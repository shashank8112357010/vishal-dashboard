import { NavLink } from "react-router";
import { cn } from "@/utils";

interface Props {
	size?: number | string;
	className?: string;
}
function Logo({ size = 50, className }: Props) {
	return (
		<NavLink to="/" className={cn(className)}>
			<img
				src="/vishallogo.png"
				alt="Vishal Cycle Store Logo"
				style={{ width: typeof size === "number" ? `${size}px` : size, height: "auto" }}
				className="object-contain"
			/>
		</NavLink>
	);
}

export default Logo;
