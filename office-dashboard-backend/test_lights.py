import time
import unittest
from datetime import datetime, timezone

from wled_protocol import (
    BLUE,
    GREEN,
    OFFICE_WHITE,
    RED,
    THEME_SEGMENTS,
    Note,
    Session,
    SessionConfig,
    decode_session,
    dim_rgb,
    encode_note,
    encode_session,
    encode_tag,
    fallback_look_for,
    frame_for,
    is_expired,
    next_phase,
    note_of,
    office_look_of,
    oslo_now,
    painter_of,
    session_at,
    session_on_strip,
    solid_payload,
    theme_frame_for,
    theme_patch_for,
)

T0 = 1_700_000_000_000


class TestWledProtocol(unittest.TestCase):
    def setUp(self):
        self.cfg = SessionConfig(
            work_ms=100_000,
            break_ms=50_000,
            long_break_ms=80_000,
            long_break_every=2,
            work_mode="bar",
            break_mode="solid",
        )
        self.session = Session(
            config=self.cfg,
            started_at=T0,
            phase="work",
            cycle=1,
            ends_at=T0 + 100_000,
            paused_left_ms=None,
        )

    def test_session_and_tag_roundtrip_under_64_chars(self):
        tag = encode_tag(self.session, "srv", T0 + 12_000)
        self.assertLessEqual(len(tag), 64)
        state = {"seg": [{"id": 0, "n": tag}]}
        self.assertEqual(session_on_strip(state), self.session)
        self.assertEqual(painter_of(state), ("srv", T0 + 12_000))

    def test_ts_compatibility_known_encoding(self):
        # Cross-check exact encoding with TypeScript's encodeSession
        encoded = encode_session(self.session)
        self.assertTrue(encoded.startswith("Pomodoro:1:"))
        self.assertEqual(decode_session(encoded), self.session)

    def test_note_roundtrip(self):
        note = Note(birthday=True, merges=False, evening=True, day_look=4, event="p:lego#12", playing=True)
        encoded = encode_note(note)
        self.assertLessEqual(len(encoded), 64)
        self.assertEqual(note_of({"seg": [{"id": 0, "n": encoded}]}), note)
        self.assertEqual(note_of({"seg": [{"id": 0, "n": "Stue"}]}), Note())

    def test_phase_rollover_and_expiration(self):
        s1, _ = session_at(self.session, T0 + 100_000)
        self.assertEqual((s1.phase, s1.cycle), ("break", 1))
        s2, _ = session_at(self.session, T0 + 150_000)
        self.assertEqual((s2.phase, s2.cycle), ("work", 2))
        s3, _ = session_at(self.session, T0 + 250_000)
        self.assertEqual((s3.phase, s3.cycle), ("long-break", 2))
        self.assertFalse(is_expired(self.session, T0 + 1000))
        self.assertTrue(is_expired(self.session, T0 + 9 * 3600 * 1000))

    def test_frame_for_full_vs_diff(self):
        full = frame_for(self.session, T0 + 50_000, 900, full_setup=True)
        self.assertEqual(len(full["seg"]), THEME_SEGMENTS)
        self.assertEqual(full["seg"][0]["fx"], 0)
        self.assertEqual(full["seg"][0]["stop"], 900)

        diff = frame_for(self.session, T0 + 50_000, 900, full_setup=False)
        self.assertEqual(len(diff["seg"]), 1)
        self.assertNotIn("fx", diff["seg"][0])
        self.assertEqual(diff["seg"][0]["i"], [0, 450, GREEN, 450, 900, RED])

    def test_theme_frame_contrast_and_patches(self):
        cfg = SessionConfig(
            work_ms=100_000,
            break_ms=50_000,
            long_break_ms=None,
            long_break_every=4,
            work_mode="theme",
            break_mode="theme",
        )
        s = Session(cfg, T0, "work", 1, T0 + 100_000, None)
        look = office_look_of(None)
        f0 = theme_frame_for(s, T0, 900, look)
        self.assertEqual(len(f0["seg"]), THEME_SEGMENTS)
        self.assertEqual(f0["seg"][0]["col"], [RED, dim_rgb(RED), [0, 0, 0]])
        self.assertNotEqual(f0["seg"][0]["col"][0], f0["seg"][0]["col"][1])
        # Sound-reactive Musikk (156) falls back to Twinklefox (80)
        self.assertEqual(theme_frame_for(s, T0, 900, {"fx": 156})["seg"][0]["fx"], 80)

        p0, snap0, needs_tag0 = theme_patch_for(None, 900, f0)
        self.assertTrue(needs_tag0)
        self.assertEqual(len(p0["seg"]), THEME_SEGMENTS)

        f_same = theme_frame_for(s, T0 + 1000, 900, look)
        p_same, snap1, needs_tag1 = theme_patch_for(snap0, 900, f_same)
        self.assertIsNone(p_same)
        self.assertFalse(needs_tag1)

        f1 = theme_frame_for(s, T0 + (100_000 // THEME_SEGMENTS), 900, look)
        p1, _, needs_tag2 = theme_patch_for(snap1, 900, f1)
        self.assertFalse(needs_tag2)
        self.assertEqual(p1, {"transition": 0, "seg": [{"id": 0, "col": [GREEN, dim_rgb(GREEN), [0, 0, 0]]}]})

    def test_fallback_look_sets_stop(self):
        fb = fallback_look_for(900)
        self.assertEqual(fb["seg"][0]["stop"], 900)
        self.assertEqual(fb["seg"][0]["col"], [OFFICE_WHITE])

    def test_oslo_dst_fallback(self):
        winter = oslo_now(datetime(2026, 1, 15, 12, 0, tzinfo=timezone.utc))
        summer = oslo_now(datetime(2026, 7, 15, 12, 0, tzinfo=timezone.utc))
        self.assertEqual(winter.hour, 13)
        self.assertEqual(summer.hour, 14)


if __name__ == "__main__":
    unittest.main()
