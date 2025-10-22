import type { CSSProperties } from "react";
import bgImg from "@/assets/images/background/banner-1.png";
import Character from "@/assets/images/characters/character_3.png";
import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Text, Title } from "@/ui/typography";

export default function BannerCard() {
	const bgStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		// !  When passing a URL of SVG to a manually constructed url() by JS, the variable should be wrapped within double quotes.
		// ! https://vite.dev/guide/assets.html
		backgroundImage: `url("${bgImg}")`,
		backgroundSize: "100%",
		backgroundPosition: "50%",
		backgroundRepeat: "no-repeat",
		opacity: 0.5,
	};
	return (
		<div className="relative bg-primary/90">
			<div className="p-6 z-2 relative">
				<div className="grid grid-cols-2 gap-4">
					<div className="col-span-2 md:col-span-1">
						<div className="flex flex-col gap-4">
							<Title as="h2" className="text-white">
								🚴‍♂️ Bicycle Shop Management
							</Title>
							<Text className="text-white">
								Manage your bicycle shop inventory, track sales, handle supplier relationships, and monitor business
								performance all in one place.
							</Text>

							<Button
								variant="outline"
								className="w-fit bg-white text-black"
								onClick={() => (window.location.href = "/bicycle-shop/dashboard")}
							>
								<Icon icon="solar:chart-2-bold-duotone" size={24} />
								<span className="ml-2 font-black">View Dashboard</span>
							</Button>
						</div>
					</div>

					<div className="col-span-2 md:col-span-1">
						<div className="w-full h-full flex items-center justify-end">
							<img src={Character} className="w-56 h-56" alt="character" />
						</div>
					</div>
				</div>
			</div>
			<div style={bgStyle} className="z-1" />
		</div>
	);
}
