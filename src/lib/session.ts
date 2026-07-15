import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface SessionData {
  takmirId?: string;
  masjidId?: string;
  masjidSlug?: string;
  nama?: string;
  peran?: string;
}

const HARI_90 = 60 * 60 * 24 * 90;

function opsiSesi(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET belum diset atau kurang dari 32 karakter. Lihat .env.example."
    );
  }
  return {
    password,
    cookieName: "amanah_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: HARI_90, // sesi bertahan lama (PRD §6.1)
      path: "/",
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, opsiSesi());
}

// Untuk halaman terproteksi: pastikan sudah login, jika tidak arahkan ke /masuk.
export async function requireSession(): Promise<Required<SessionData>> {
  const session = await getSession();
  if (!session.takmirId || !session.masjidId) {
    redirect("/masuk");
  }
  return session as Required<SessionData>;
}
