import { Component, type ReactNode, type ErrorInfo } from "react";
import { TriangleAlert } from "lucide-react";
import { ErrorDisplay } from "./ErrorDisplay";
import ErrorShell from "@/app/ErrorShell";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AppErrorBoundary:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorShell>
          <ErrorDisplay
            icon={TriangleAlert}
            title="Noe gikk galt"
            description="En uventet feil oppstod. Prøv å laste siden på nytt."
            error={this.state.error}
          />
        </ErrorShell>
      );
    }

    return this.props.children;
  }
}
