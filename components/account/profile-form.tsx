"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

type Profile = {
  fullName: string;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  bio?: string | null;
  skills: string[];
  education?: string[] | null;
  workExperience?: string[] | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
};

const emptyProfile: Profile = { fullName: "", phone: "", location: "", headline: "", bio: "", skills: [], education: [], workExperience: [], websiteUrl: "", linkedinUrl: "", githubUrl: "" };

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiClient.get("/account/profile");
        const loaded = response.data.data.profile;
        if (loaded) {
          setProfile({ ...emptyProfile, ...loaded, education: Array.isArray(loaded.education) ? loaded.education : [], workExperience: Array.isArray(loaded.workExperience) ? loaded.workExperience : [] });
          setSkillsInput((loaded.skills || []).join(", "));
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load profile."));
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...profile,
        skills: skillsInput.split(",").map((skill) => skill.trim()).filter(Boolean),
        education: Array.isArray(profile.education) ? profile.education.join("\n") : "",
        workExperience: Array.isArray(profile.workExperience) ? profile.workExperience.join("\n") : "",
      };
      const response = await apiClient.put("/account/profile", payload);
      const saved = response.data.data.profile;
      setProfile({ ...emptyProfile, ...saved, education: Array.isArray(saved.education) ? saved.education : [], workExperience: Array.isArray(saved.workExperience) ? saved.workExperience : [] });
      setSkillsInput((saved.skills || []).join(", "));
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not save profile."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><CardContent className="p-6 text-sm text-slate-500">Loading profile...</CardContent></Card>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert>}
      {message && <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">{message}</Alert>}
      <Card>
        <CardHeader>
          <CardTitle>Candidate profile</CardTitle>
          <CardDescription>This information helps employers understand your background before opening your CV.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2"><Label>Full name</Label><Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Headline</Label><Input placeholder="Junior frontend developer" value={profile.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Location</Label><Input placeholder="Sofia, Bulgaria" value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Skills</Label><Input placeholder="TypeScript, React, PostgreSQL" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Bio</Label><Textarea rows={5} value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Experience and links</CardTitle><CardDescription>One item per line for education and work experience.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2"><Label>Education</Label><Textarea rows={5} value={(profile.education || []).join("\n")} onChange={(e) => setProfile({ ...profile, education: e.target.value.split("\n") })} /></div>
          <div className="space-y-2"><Label>Work experience</Label><Textarea rows={5} value={(profile.workExperience || []).join("\n")} onChange={(e) => setProfile({ ...profile, workExperience: e.target.value.split("\n") })} /></div>
          <div className="space-y-2"><Label>Website</Label><Input value={profile.websiteUrl || ""} onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })} /></div>
          <div className="space-y-2"><Label>LinkedIn</Label><Input value={profile.linkedinUrl || ""} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} /></div>
          <div className="space-y-2"><Label>GitHub</Label><Input value={profile.githubUrl || ""} onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button></div>
    </form>
  );
}
