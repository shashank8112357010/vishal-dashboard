// Stub file - Mock utilities removed, using real backend
// Kept for template compatibility only

export const fakeAvatars = (count: number): string[] => {
	return Array.from({ length: count }, (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`);
};
