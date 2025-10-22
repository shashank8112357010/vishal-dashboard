import { Checkbox, Select, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type React from "react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { useCreateOrUpdateRolePermission, useRolePermission } from "@/services/rolePermissionService";
import type { PermissionModule } from "@/types/entity";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";

const { Option } = Select;

// Available modules in the system
const AVAILABLE_MODULES = [
	{ key: "parties", label: "Parties Management" },
	{ key: "inventory", label: "Inventory Management" },
	{ key: "invoices", label: "Invoices Management" },
	{ key: "employees", label: "Employee Management" },
	{ key: "attendance", label: "Attendance Management" },
	{ key: "payroll", label: "Payroll Management" },
	{ key: "settings", label: "Role Settings" },
];

const RoleSettingsPage: React.FC = () => {
	const [selectedRole, setSelectedRole] = useState<"sales" | "manager" | "admin">("manager");
	const [permissions, setPermissions] = useState<PermissionModule[]>([]);

	const { data: rolePermission } = useRolePermission(selectedRole);
	const updateMutation = useCreateOrUpdateRolePermission();

	useEffect(() => {
		if (rolePermission) {
			setPermissions(rolePermission.permissions);
		} else {
			// Initialize with default permissions for the role
			const defaultPermissions: PermissionModule[] = AVAILABLE_MODULES.map((module) => ({
				module: module.key,
				canView: selectedRole !== "sales" || ["parties", "inventory", "invoices"].includes(module.key),
				canCreate: selectedRole !== "sales" || module.key === "invoices",
				canEdit: selectedRole === "admin" || selectedRole === "manager",
				canDelete: selectedRole === "admin",
			}));
			setPermissions(defaultPermissions);
		}
	}, [rolePermission, selectedRole]);

	const handlePermissionChange = (moduleKey: string, permission: keyof PermissionModule, value: boolean) => {
		setPermissions((prev) => {
			const existing = prev.find((p) => p.module === moduleKey);
			if (existing) {
				return prev.map((p) => (p.module === moduleKey ? { ...p, [permission]: value } : p));
			}
			return [
				...prev,
				{ module: moduleKey, canView: false, canCreate: false, canEdit: false, canDelete: false, [permission]: value },
			];
		});
	};

	const handleSave = async () => {
		try {
			await updateMutation.mutateAsync({
				role: selectedRole,
				permissions,
			});
			message.success(`Permissions updated successfully for ${selectedRole} role`);
		} catch (_error) {
			message.error("Failed to update permissions");
		}
	};

	const columns: ColumnsType<{ key: string; label: string }> = [
		{
			title: "Module",
			dataIndex: "label",
			key: "label",
			width: 250,
		},
		{
			title: "View",
			key: "view",
			align: "center",
			width: 100,
			render: (_, record) => {
				const perm = permissions.find((p) => p.module === record.key);
				return (
					<Checkbox
						checked={perm?.canView || false}
						onChange={(e) => handlePermissionChange(record.key, "canView", e.target.checked)}
					/>
				);
			},
		},
		{
			title: "Create",
			key: "create",
			align: "center",
			width: 100,
			render: (_, record) => {
				const perm = permissions.find((p) => p.module === record.key);
				return (
					<Checkbox
						checked={perm?.canCreate || false}
						onChange={(e) => handlePermissionChange(record.key, "canCreate", e.target.checked)}
					/>
				);
			},
		},
		{
			title: "Edit",
			key: "edit",
			align: "center",
			width: 100,
			render: (_, record) => {
				const perm = permissions.find((p) => p.module === record.key);
				return (
					<Checkbox
						checked={perm?.canEdit || false}
						onChange={(e) => handlePermissionChange(record.key, "canEdit", e.target.checked)}
					/>
				);
			},
		},
		{
			title: "Delete",
			key: "delete",
			align: "center",
			width: 100,
			render: (_, record) => {
				const perm = permissions.find((p) => p.module === record.key);
				return (
					<Checkbox
						checked={perm?.canDelete || false}
						onChange={(e) => handlePermissionChange(record.key, "canDelete", e.target.checked)}
					/>
				);
			},
		},
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">Role Permission Settings</h2>
						<p className="text-muted-foreground">Configure dynamic permissions for each user role</p>
					</div>
					<Button onClick={handleSave} disabled={updateMutation.isPending}>
						<Icon icon="solar:diskette-bold-duotone" size={18} className="mr-2" />
						Save Permissions
					</Button>
				</div>
				<div className="pt-4">
					<div className="flex items-center gap-2">
						<span className="font-medium">Select Role:</span>
						<Select
							value={selectedRole}
							onChange={(value) => setSelectedRole(value as "sales" | "manager" | "admin")}
							className="w-48"
						>
							<Option value="sales">Sales</Option>
							<Option value="manager">Manager</Option>
							<Option value="admin">Admin</Option>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
					<div className="flex items-start gap-2">
						<Icon icon="solar:info-circle-bold" size={20} className="text-blue-600 dark:text-blue-400" />
						<div className="text-sm text-blue-800 dark:text-blue-200">
							<p className="font-medium mb-1">Permission Guidelines:</p>
							<ul className="list-disc list-inside space-y-1">
								<li>
									<strong>View:</strong> Ability to view and read data from the module
								</li>
								<li>
									<strong>Create:</strong> Ability to add new records to the module
								</li>
								<li>
									<strong>Edit:</strong> Ability to modify existing records
								</li>
								<li>
									<strong>Delete:</strong> Ability to remove records from the module
								</li>
							</ul>
						</div>
					</div>
				</div>
				<Table rowKey="key" columns={columns} dataSource={AVAILABLE_MODULES} pagination={false} size="small" />
			</CardContent>
		</Card>
	);
};

export default RoleSettingsPage;
