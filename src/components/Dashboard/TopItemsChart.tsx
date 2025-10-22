import { Card } from "antd";
import type React from "react";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useInvoices } from "@/services/invoiceService";
import { useInventory } from "@/services/inventoryService";

const TopItemsChart: React.FC = () => {
	const { data: invoices = [] } = useInvoices();
	const { data: items = [] } = useInventory();

	const chartData = useMemo(() => {
		// Calculate sales quantity per item
		const itemSales: Record<string, { quantity: number; revenue: number }> = {};

		invoices
			.filter((inv) => inv.invoiceType === "sale")
			.forEach((invoice) => {
				invoice.items.forEach((invoiceItem) => {
					const itemId = typeof invoiceItem.itemId === "string" ? invoiceItem.itemId : invoiceItem.itemId._id;
					if (!itemSales[itemId]) {
						itemSales[itemId] = { quantity: 0, revenue: 0 };
					}
					itemSales[itemId].quantity += invoiceItem.quantity;
					itemSales[itemId].revenue += invoiceItem.totalAmount;
				});
			});

		// Get top 5 items by quantity sold
		const topItems = Object.entries(itemSales)
			.sort(([, a], [, b]) => b.quantity - a.quantity)
			.slice(0, 5)
			.map(([itemId, data]) => {
				const item = items.find((i: any) => i._id === itemId);
				return {
					name: item?.itemName || "Unknown",
					quantity: data.quantity,
					revenue: data.revenue,
				};
			});

		return {
			categories: topItems.map((item) => item.name),
			quantities: topItems.map((item) => item.quantity),
			revenues: topItems.map((item) => item.revenue),
		};
	}, [invoices, items]);

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: "bar",
			toolbar: { show: false },
		},
		plotOptions: {
			bar: {
				horizontal: true,
				borderRadius: 4,
				dataLabels: { position: "top" },
			},
		},
		dataLabels: {
			enabled: true,
			offsetX: 30,
			style: { fontSize: "12px", colors: ["var(--colors-text-primary)"] },
		},
		xaxis: {
			categories: chartData.categories,
			labels: { style: { colors: "var(--colors-text-secondary)" } },
		},
		yaxis: {
			labels: {
				style: { colors: "var(--colors-text-secondary)" },
			},
		},
		colors: ["#1890ff"],
		tooltip: {
			y: {
				formatter: (value) => `${value} units`,
			},
		},
	};

	const series = [{ name: "Quantity Sold", data: chartData.quantities }];

	return (
		<Card title="Top 5 Selling Items" size="small">
			{chartData.categories.length > 0 ? (
				<ReactApexChart options={options} series={series} type="bar" height={300} />
			) : (
				<div className="flex items-center justify-center h-[300px] text-muted-foreground">No sales data available</div>
			)}
		</Card>
	);
};

export default TopItemsChart;
