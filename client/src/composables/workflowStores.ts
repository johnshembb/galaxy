import { inject, onScopeDispose, provide, type Ref, ref } from "vue";

import { useConnectionStore } from "@/stores/workflowConnectionStore";
import { useWorkflowCommentStore } from "@/stores/workflowEditorCommentStore";
import { useWorkflowStateStore } from "@/stores/workflowEditorStateStore";
import { useWorkflowEditorToolbarStore } from "@/stores/workflowEditorToolbarStore";
import { useWorkflowStepStore } from "@/stores/workflowStepStore";

/**
 * Creates stores scoped to a specific workflowId, and manages their lifetime.
 * In child components, use `useWorkflowStores` instead.
 *
 * Provides `workflowId` to all child components.
 *
 * @param workflowId the workflow to scope to
 * @returns workflow Stores
 */
export function provideScopedWorkflowStores(workflowId: Ref<string> | string) {
    if (typeof workflowId === "string") {
        workflowId = ref(workflowId);
    }

    provide("workflowId", workflowId);

    const connectionStore = useConnectionStore(workflowId.value);
    const stateStore = useWorkflowStateStore(workflowId.value);
    const stepStore = useWorkflowStepStore(workflowId.value);
    const commentStore = useWorkflowCommentStore(workflowId.value);
    const toolbarStore = useWorkflowEditorToolbarStore(workflowId.value);

    onScopeDispose(() => {
        connectionStore.$dispose();
        stateStore.$dispose();
        stepStore.$dispose();
        commentStore.$dispose();
        toolbarStore.$dispose();
    });

    return {
        connectionStore,
        stateStore,
        stepStore,
        commentStore,
        toolbarStore,
    };
}

/**
 * Uses all workflow related stores scoped to the workflow defined by a parent component.
 * Does not manage lifetime.
 *
 * `provideScopedWorkflowStores` needs to be called by a parent component,
 * or this composable will throw an error.
 *
 * @returns workflow stores
 */
export function useWorkflowStores() {
    const workflowId = inject("workflowId") as Ref<string>;

    if (typeof workflowId?.value !== "string") {
        throw new Error(
            "Workflow ID not provided by parent component. Use `provideScopedWorkflowStores` on a parent component."
        );
    }

    const connectionStore = useConnectionStore(workflowId.value);
    const stateStore = useWorkflowStateStore(workflowId.value);
    const stepStore = useWorkflowStepStore(workflowId.value);
    const commentStore = useWorkflowCommentStore(workflowId.value);
    const toolbarStore = useWorkflowEditorToolbarStore(workflowId.value);

    return {
        connectionStore,
        stateStore,
        stepStore,
        commentStore,
        toolbarStore,
    };
}
