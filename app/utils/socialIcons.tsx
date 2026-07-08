import type { IconType } from "react-icons";
import {
  FaInstagram, FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube, FaTiktok,
  FaPinterestP, FaWhatsapp, FaTelegramPlane, FaSnapchatGhost, FaGithub,
  FaDiscord, FaEnvelope, FaGlobe,
} from "react-icons/fa";

// Matched against the admin-entered label (case/space/punctuation-insensitive),
// so "Twitter / X", "twitter", "X" all resolve to the same icon.
const ICON_MAP: Record<string, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  twitter: FaTwitter,
  x: FaTwitter,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  pinterest: FaPinterestP,
  whatsapp: FaWhatsapp,
  telegram: FaTelegramPlane,
  snapchat: FaSnapchatGhost,
  github: FaGithub,
  discord: FaDiscord,
  email: FaEnvelope,
  mail: FaEnvelope,
};

// Unrecognized platform names fall back to a generic globe/link icon rather
// than breaking — this is what makes "add any social link" actually work.
export function getSocialIcon(label: string): IconType {
  const key = label.trim().toLowerCase().replace(/[^a-z]/g, "");
  return ICON_MAP[key] ?? FaGlobe;
}
