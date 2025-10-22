import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card } from "antd";
import type React from "react";
import { useMemo } from "react";

interface EnhancedStatsCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	iconColor?: string;
	iconBgColor?: string;
	trend?: number; // percentage change
	data?: number[]; // sparkline data
	loading?: boolean;
}

const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
	title,
	value,
	icon,
	iconColor = "#1890ff",
	iconBgColor = "rgba(24, 144, 255, 0.1)",
	trend,
	data = [],
	loading = false,
}) => {
	// Generate simple sparkline bars
	const sparklineBars = useMemo(() => {
		if (data.length === 0) return null;

		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min || 1;

		return data.map((value, index) => {
			const height = ((value - min) / range) * 40 + 10; // 10-50px height
			return (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: sparkline bars are static
					key={index}
					style={{
						width: "6px",
						height: `${height}px`,
						backgroundColor: iconColor,
						borderRadius: "2px",
						opacity: 0.7,
					}}
				/>
			);
		});
	}, [data, iconColor]);

	const trendIcon = trend && trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
	const trendColor = trend && trend > 0 ? "#52c41a" : "#ff4d4f";

	return (
		<Card
			loading={loading}
			style={{
				height: "100%",
				borderRadius: "12px",
				border: "1px solid #f0f0f0",
			}}
			bodyStyle={{
				padding: "20px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
			}}
		>
			{/* Icon */}
			<div
				style={{
					width: "48px",
					height: "48px",
					borderRadius: "12px",
					backgroundColor: iconBgColor,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: "24px",
					color: iconColor,
					marginBottom: "16px",
				}}
			>
				{icon}
			</div>

			{/* Title */}
			<div
				style={{
					fontSize: "14px",
					color: "#8c8c8c",
					marginBottom: "8px",
					fontWeight: 500,
				}}
			>
				{title}
			</div>

			{/* Value and Trend */}
			<div
				style={{
					display: "flex",
					alignItems: "baseline",
					justifyContent: "space-between",
					marginBottom: "16px",
				}}
			>
				<div
					style={{
						fontSize: "28px",
						fontWeight: 600,
						color: "#262626",
					}}
				>
					{value}
				</div>
				{trend !== undefined && (
					<div
						style={{
							fontSize: "14px",
							color: trendColor,
							fontWeight: 500,
						}}
					>
						{trendIcon} {Math.abs(trend)}%
					</div>
				)}
			</div>

			{/* Sparkline Chart */}
			{data.length > 0 && (
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						justifyContent: "space-between",
						gap: "4px",
						height: "50px",
					}}
				>
					{sparklineBars}
				</div>
			)}
		</Card>
	);
};

export default EnhancedStatsCard;
