//* src/components/auth/GoogleSignInButton.tsx

import { GoogleLogin } from "@react-oauth/google";

import GoogleIcon from "@/components/icons/GoogleIcon";

interface GoogleSignInButtonProps {
	onSuccess: (idToken: string) => void;
	onError: () => void;
	label?: string;
}

/**
 * Our own styled Google button. Google's real button sits invisibly on top,
 * stretched to cover ours, so it catches every click.
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
				className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-background text-base font-medium text-foreground hover:bg-muted transition-colors cursor-pointer group-focus-within:outline-2 group-focus-within:outline-ring"
			>
				<GoogleIcon className="size-5" />
				<span>{label}</span>
			</button>

			{/* Google's real button, hidden on top; it opens the Google popup */}
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
