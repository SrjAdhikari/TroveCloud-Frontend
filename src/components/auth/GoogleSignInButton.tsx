//* src/components/auth/GoogleSignInButton.tsx

import { GoogleLogin } from "@react-oauth/google";

import GoogleIcon from "@/components/icons/GoogleIcon";

interface GoogleSignInButtonProps {
	onSuccess: (idToken: string) => void;
	onError: () => void;
	label?: string;
}

/**
 * Fully styleable Google sign-in button.
 *
 * NOTE: The hit-area is sized to the visual button; if you change the
 * button height, the overlay width="100%" follows the wrapper width.
 */
const GoogleSignInButton = ({
	onSuccess,
	onError,
	label = "Continue with Google",
}: GoogleSignInButtonProps) => {
	return (
		<div className="group relative w-full">
			<button
				type="button"
				tabIndex={-1}
				className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-background text-base font-medium text-foreground hover:bg-muted transition-colors cursor-pointer group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2"
			>
				<GoogleIcon className="size-5" />
				<span>{label}</span>
			</button>

			{/* Invisible Google widget — catches clicks and triggers ID-token popup */}
			<div className="absolute inset-0 opacity-0 [&>div]:h-full!">
				<GoogleLogin
					onSuccess={(credentialResponse) => {
						if (credentialResponse.credential) {
							onSuccess(credentialResponse.credential);
						} else {
							onError();
						}
					}}
					onError={onError}
					theme="outline"
					size="large"
					width="400"
				/>
			</div>
		</div>
	);
};

export default GoogleSignInButton;
