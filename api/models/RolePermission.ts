import mongoose, { type Document, Schema } from "mongoose";
import type { UserRole } from "./User.js";

export interface IPermission {
	module: string;
	canView: boolean;
	canCreate: boolean;
	canEdit: boolean;
	canDelete: boolean;
}

export interface IRolePermission extends Document {
	role: UserRole;
	permissions: IPermission[];
	createdAt: Date;
	updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
	{
		module: {
			type: String,
			required: [true, "Module name is required"],
			trim: true,
		},
		canView: {
			type: Boolean,
			default: false,
		},
		canCreate: {
			type: Boolean,
			default: false,
		},
		canEdit: {
			type: Boolean,
			default: false,
		},
		canDelete: {
			type: Boolean,
			default: false,
		},
	},
	{ _id: false },
);

const rolePermissionSchema = new Schema<IRolePermission>(
	{
		role: {
			type: String,
			enum: ["sales", "manager", "admin"],
			required: [true, "Role is required"],
			unique: true,
		},
		permissions: {
			type: [permissionSchema],
			default: [],
		},
	},
	{
		timestamps: true,
	},
);

const RolePermission = mongoose.model<IRolePermission>("RolePermission", rolePermissionSchema);

export default RolePermission;
