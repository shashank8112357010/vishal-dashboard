import { Card } from "antd";
import type React from "react";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useInventory } from "@/services/inventoryService";
import type { InventoryItem } from "@/types/entity";

const InventoryDistributionChart: React.FC = () => {
	const { data: items = [] } = useInventory();

	const chartData = useMemo(() => {
		const bicycles = items.filter((item: InventoryItem) => item.category === "bicycle");
		const spareParts = items.filter((item: InventoryItem) => item.category === "spare_part");

		const bicycleValue = bicycles.reduce(
			(sum: number, item: InventoryItem) => sum + item.quantityAvailable * item.sellingPrice,
			0,
		);
		const sparePartValue = spareParts.reduce(
			(sum: number, item: InventoryItem) => sum + item.quantityAvailable * item.sellingPrice,
			0,
		);

		return {
			labels: ["Bicycles", "Spare Parts"],
			series: [bicycleValue, sparePartValue],
		};
	}, [items]);

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: "donut",
		},
		labels: chartData.labels,
		colors: ["#1890ff", "#52c41a"],
		legend: {
			position: "bottom",
			labels: { colors: "var(--colors-text-primary)" },
		},
		dataLabels: {
			enabled: true,
			formatter: (val) => `${Number(val).toFixed(1)}%`,
		},
		tooltip: {
			y: {
				formatter: (value) => `₹${value.toLocaleString()}`,
			},
		},
		plotOptions: {
			pie: {
				donut: {
					size: "65%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total Value",
							formatter: () => {
								const total = chartData.series.reduce((a, b) => a + b, 0);
								return `₹${total.toLocaleString()}`;
							},
						},
					},
				},
			},
		},
	};

	return (
		<Card title="Inventory Value Distribution" size="small">
			<ReactApexChart options={options} series={chartData.series} type="donut" height={300} />
		</Card>
	);
};

export default InventoryDistributionChart;
