declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_UDID_TOOLS_RELEASE_TAG?: string;
    readonly NEXT_PUBLIC_UDID_TOOLS_SOURCE_SHA?: string;
    readonly NEXT_PUBLIC_VERCEL_ENV?: string;
  }
}
