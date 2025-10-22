import { Card, Statistic } from "antd";
import type React from "react";
import type { ReactNode } from "react";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon?: ReactNode;
	color?: string;
	suffix?: string;
	loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = "#1890ff", suffix, loading = false }) => {
	return (
		<Card loading={loading}>
			<Statistic title={title} value={value} prefix={icon} suffix={suffix} valueStyle={{ color, fontSize: "24px" }} />
		</Card>
	);
};

export default StatsCard;
