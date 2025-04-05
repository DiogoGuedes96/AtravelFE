export default class ProfilePermissionService {
  private static instance: ProfilePermissionService;
  private permissions: string[];
  private profile: string;

  constructor() {
    const userStorage = localStorage.getItem("user") || null;

    this.permissions =
      userStorage && JSON.parse(userStorage).canAccess
        ? JSON.parse(userStorage).canAccess.reduce((array: any, item: any) => {
            if (typeof item.permissions == "string") {
              item.permissions = JSON.parse(item.permissions);
            }

            Object.entries(item.permissions || []).forEach(([key, value]) =>
              array.push(`${item.module}-${key}:${value}`)
            );

            return array;
          }, [])
        : null;

    this.profile = userStorage && JSON.parse(userStorage)
      ? JSON.parse(userStorage).role
      : null;
  }

  public static getInstance(): ProfilePermissionService {
    if (!ProfilePermissionService.instance) {
      ProfilePermissionService.instance = new ProfilePermissionService();
    }

    return ProfilePermissionService.instance;
  }

  public hasPermission(permissions: string | string[]): boolean {
    if (Array.isArray(permissions)) {
      return permissions.some((permission: string) => this.permissions.includes(permission));
    }

    return this.permissions.includes(permissions);
  }

  public hasProfile(profiles: string | string[]): boolean {
    if (Array.isArray(profiles)) {
      return profiles.includes(this.profile);
    }

    return this.profile === profiles;
  }
}
