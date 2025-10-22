import { Card } from "antd";
import type React from "react";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { useInvoices } from "@/services/invoiceService";
import dayjs from "dayjs";

const SalesTrendChart: React.FC = () => {
	const { data: invoices = [] } = useInvoices();

	const chartData = useMemo(() => {
		// Get last 7 days of data
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = dayjs().subtract(6 - i, "day");
			return {
				date: date.format("MMM DD"),
				dateKey: date.format("YYYY-MM-DD"),
			};
		});

		const salesByDate = invoices
			.filter((inv) => inv.invoiceType === "sale")
			.reduce(
				(acc, inv) => {
					const date = dayjs(inv.date).format("YYYY-MM-DD");
					acc[date] = (acc[date] || 0) + inv.totalAmount;
					return acc;
				},
				{} as Record<string, number>,
			);

		const purchasesByDate = invoices
			.filter((inv) => inv.invoiceType === "purchase")
			.reduce(
				(acc, inv) => {
					const date = dayjs(inv.date).format("YYYY-MM-DD");
					acc[date] = (acc[date] || 0) + inv.totalAmount;
					return acc;
				},
				{} as Record<string, number>,
			);

		const salesData = last7Days.map((day) => salesByDate[day.dateKey] || 0);
		const purchasesData = last7Days.map((day) => purchasesByDate[day.dateKey] || 0);
		const categories = last7Days.map((day) => day.date);

		return { salesData, purchasesData, categories };
	}, [invoices]);

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: "area",
			toolbar: { show: false },
			zoom: { enabled: false },
		},
		dataLabels: { enabled: false },
		stroke: { curve: "smooth", width: 2 },
		xaxis: {
			categories: chartData.categories,
			labels: { style: { colors: "var(--colors-text-secondary)" } },
		},
		yaxis: {
			labels: {
				style: { colors: "var(--colors-text-secondary)" },
				formatter: (value) => `₹${value.toLocaleString()}`,
			},
		},
		colors: ["#52c41a", "#ff4d4f"],
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.7,
				opacityTo: 0.2,
			},
		},
		legend: {
			position: "top",
			horizontalAlign: "right",
			labels: { colors: "var(--colors-text-primary)" },
		},
		tooltip: {
			y: {
				formatter: (value) => `₹${value.toLocaleString()}`,
			},
		},
	};

	const series = [
		{ name: "Sales", data: chartData.salesData },
		{ name: "Purchases", data: chartData.purchasesData },
	];

	return (
		<Card title="Sales & Purchase Trend (Last 7 Days)" size="small">
			<ReactApexChart options={options} series={series} type="area" height={300} />
		</Card>
	);
};

export default SalesTrendChart;
