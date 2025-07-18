import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import EmbeddableChatWidget from "@/app/(embedbot)/chatbot-iframe/[agentId]/embed";
import { chatInterfaceSchema, type ChatInterfaceFormValues } from "@/lib/validations/chat-interface";
import { uploadFileToSupabase } from "@/utils/upload";
import React from "react";


export function ChatInterfaceSettings() {
    const form = useForm<ChatInterfaceFormValues>({
        resolver: zodResolver(chatInterfaceSchema),
        defaultValues: {
            displayName: "",
            profilePicture: undefined,
            chatBubbleTriggerIcon: undefined,
            userMessageColor: "#2563eb",
            syncUserMessageColorWithAgentHeader: false,
            chatBubbleButtonColor: "#000000",
            initialMessages: "",
            suggestedMessages: [],
            messagePlaceholder: "",
            footer: "",
            dismissibleNotice: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "suggestedMessages",
    });

    const [uploadingProfile, setUploadingProfile] = React.useState(false);
    const [uploadingIcon, setUploadingIcon] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    // Extracted upload handlers
    const handleProfilePictureUpload = async (file: File) => {
        setUploadingProfile(true);
        setUploadError(null);
        try {
            const uploaded = await uploadFileToSupabase(file, "bucket");
            form.setValue("profilePicture", uploaded.url);
        } catch (err: any) {
            setUploadError(err.message || "Failed to upload profile picture");
        } finally {
            setUploadingProfile(false);
        }
    };

    const handleChatIconUpload = async (file: File) => {
        setUploadingIcon(true);
        setUploadError(null);
        try {
            const uploaded = await uploadFileToSupabase(file, "bucket");
            form.setValue("chatBubbleTriggerIcon", uploaded.url);
        } catch (err: any) {
            setUploadError(err.message || "Failed to upload chat icon");
        } finally {
            setUploadingIcon(false);
        }
    };

    // Watch all form values for live preview
    const settings = form.watch();

    return (
        <div className="flex gap-8 items-start">
            {/* Settings Form */}
            <div className="w-full flex-1">
                <form className="border rounded-lg p-6 space-y-6 max-w-2xl">
                    <h2 className="text-xl font-semibold mb-6">Chat Interface</h2>



                    {/* Initial messages */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Initial messages</label>
                        <Textarea {...form.register("initialMessages")}
                            placeholder="Enter each message in a new line." rows={3} />
                        <Button type="button" variant="outline" size="sm" className="mt-2">Reset</Button>
                    </div>

                    {/* Suggested messages */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Suggested messages</label>
                        {fields.map((field, idx) => (
                            <div key={field.id} className="flex gap-2 mb-1">
                                <Input {...form.register(`suggestedMessages.${idx}.value` as const)} />
                                <Button type="button" variant="outline" size="icon" onClick={() => remove(idx)}>-</Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>+ Add suggested message</Button>
                    </div>


                    {/* Message placeholder */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message placeholder</label>
                        <Input {...form.register("messagePlaceholder")} placeholder="Message..." />
                    </div>


                    {/* Footer */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Footer</label>
                        <Textarea {...form.register("footer")} placeholder="You can use this to add a disclaimer or a link to your privacy policy." rows={2} />
                        <div className="text-xs text-muted-foreground">0/200 characters</div>
                    </div>

                    {/* Dismissible notice */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Dismissable notice</label>
                        <Textarea {...form.register("dismissibleNotice")} placeholder="You can use this to add a dismissable notice. It will be dismissed after the user sends a message." rows={2} />
                        <div className="text-xs text-muted-foreground">0/200 characters</div>
                    </div>

                    <Separator />

                    {/* Save button */}{/* Display name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Display name</label>
                        <Input {...form.register("displayName")} />
                    </div>

                    {/* Profile picture */}
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                                {form.watch("profilePicture") ? (
                                    <img src={typeof form.watch("profilePicture") === "string" ? form.watch("profilePicture") : URL.createObjectURL(form.watch("profilePicture"))} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                                ) : null}
                            </div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml"
                                className="hidden"
                                id="profilePictureUpload"
                                onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        await handleProfilePictureUpload(file);
                                    }
                                }}
                            />
                            <label htmlFor="profilePictureUpload">
                                <Button asChild variant="outline" size="sm" disabled={uploadingProfile}>
                                    <span>{uploadingProfile ? "Uploading..." : "Upload image"}</span>
                                </Button>
                            </label>
                            <span className="text-xs text-muted-foreground">Supports JPG, PNG, and SVG files up to 1MB</span>
                        </div>
                        {/* Chat icon */}
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                                {form.watch("chatBubbleTriggerIcon") ? (
                                    <img src={typeof form.watch("chatBubbleTriggerIcon") === "string" ? form.watch("chatBubbleTriggerIcon") : URL.createObjectURL(form.watch("chatBubbleTriggerIcon"))} alt="Chat Icon" className="w-16 h-16 rounded-full object-cover" />
                                ) : null}
                            </div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml"
                                className="hidden"
                                id="chatBubbleTriggerIconUpload"
                                onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        await handleChatIconUpload(file);
                                    }
                                }}
                            />
                            <label htmlFor="chatBubbleTriggerIconUpload">
                                <Button asChild variant="outline" size="sm" disabled={uploadingIcon}>
                                    <span>{uploadingIcon ? "Uploading..." : "Upload image"}</span>
                                </Button>
                            </label>
                            <span className="text-xs text-muted-foreground">Supports JPG, PNG, and SVG files up to 1MB</span>
                        </div>
                    </div>
                    {uploadError && <div className="text-red-500 text-xs mt-2">{uploadError}</div>}

                    {/* User message color */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                {...form.register("userMessageColor")}
                                className="w-6 h-6 p-0 border-none bg-transparent"
                            />
                            <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue("userMessageColor", "#2563eb")}>Reset</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...form.register("syncUserMessageColorWithAgentHeader")}
                                id="syncUserMessageColorWithAgentHeader"
                            />
                            <label htmlFor="syncUserMessageColorWithAgentHeader" className="text-sm">Sync user message color with agent header</label>
                        </div>
                    </div>

                    {/* Chat bubble button color */}
                    <div className="flex items-center gap-4 mt-4">
                        <input
                            type="color"
                            {...form.register("chatBubbleButtonColor")}
                            className="w-6 h-6 p-0 border-none bg-transparent"
                        />
                        <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue("chatBubbleButtonColor", "#000000")}>Reset</Button>
                    </div>


                    <Button type="submit">Save</Button>
                </form>
            </div>

            {/* Preview TODO: make it responsive */}
            <div
                className="fixed top-1/2 -translate-y-1/2 right-0"
            >
                <EmbeddableChatWidget isCustomizingView={true} settings={settings} />
            </div>


        </div>
    );
}
