import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LoginServiceService } from 'src/app/Service/login-service.service';

interface Provider {
  id: number;
  name: string;
  type: string;
  isActive?: boolean;
  order?: number;
  [k: string]: any;
}

@Component({
  selector: 'app-admin-dashboard-component',
  templateUrl: './admin-dashboard-component.component.html'
})
export class AdminDashboardComponentComponent {

  form!: FormGroup;

  // raw API data
  authProvidersData: Provider[] = [];

  // stable options used in templates (do NOT recreate these on each CD)
  typesOptions: Array<{ label: string; value: string }> = [];
  namesByTypeMap: { [type: string]: Array<{ label: string; value: number }> } = {};

  constructor(private fb: FormBuilder, private loginService: LoginServiceService ,private messageService: MessageService) {}

  ngOnInit(): void {
    this.initForm();
    this.getAuthProviderData();
  }

  // ------------------ FORM INIT ------------------
  private initForm() {
    this.form = this.fb.group({
      mode: ['Regular_Login', Validators.required],

      // general group
      general: this.fb.group({
        type: [[], Validators.required],
        name: [[], Validators.required]    // stores provider id (number)
      }),

      // arrays
      twoFactor: this.fb.array([]),     // FormArray<FormGroup>
      multiFactor: this.fb.array([])
    });

    // when general.type changes -> clear/patch name (keeps consistent values)
    (this.form.get('general') as FormGroup).get('type')!.valueChanges.subscribe((t) => {
      this.onGeneralTypeChange(t);
    });

    // when mode changes -> ensure arrays / defaults
    this.form.get('mode')!.valueChanges.subscribe((m) => {
      this.onModeChange(m);
    });
  }


  getNamesForSelectedTypes(types: string[]): Array<{label:string,value:number}> {

  if (!types || !types.length) return [];

  const providers = this.authProvidersData.filter(p =>
    types.includes(p.type)
  );

  return providers.map(p => ({
    label: p.name,
    value: p.id
  }));
}

  // ------------------ API ------------------
  private getAuthProviderData() {
    this.loginService.getAuthProviders().subscribe((res: any) => {
      this.authProvidersData = Array.isArray(res) ? res : [];

      // build stable options
      this.buildOptionsFromData();

      // auto-select mode and prefill controls/arrays based on data
      this.autoSelectAndPrefill();
    });
  }

  // build typesOptions and namesByTypeMap once (stable references)
  private buildOptionsFromData() {
    const types = Array.from(new Set(this.authProvidersData.map(p => p.type ?? '').filter(Boolean)));
    this.typesOptions = types.map(t => ({ label: t, value: t }));

    this.namesByTypeMap = {};
    types.forEach(t => {
      this.namesByTypeMap[t] = this.authProvidersData
        .filter(p => p.type === t)
        .map(p => ({ label: p.name, value: p.id }));
    });
  }

  // ------------------ MODE / PREFILL ------------------
 private autoSelectAndPrefill() {

  if (!this.authProvidersData.length) return;

  // 1) only active providers, sorted by order (stable)
  const activeProviders = this.authProvidersData
    .filter(p => p.isActive)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!activeProviders.length) return;

  // 2) group providers by order value -> Map<order, Provider[]>
  const orderMap = activeProviders.reduce((m: Map<number, Provider[]>, p) => {
    const ord = (p.order ?? 0);
    if (!m.has(ord)) m.set(ord, []);
    m.get(ord)!.push(p);
    return m;
  }, new Map<number, Provider[]>());

  // unique orders sorted ascending
  const uniqueOrders = Array.from(orderMap.keys()).sort((a, b) => a - b);

  // quick helpers
  const allTypes = Array.from(new Set(activeProviders.map(p => p.type)));
  const allIds = activeProviders.map(p => p.id);

  // Safety heuristic:
  // If backend used incremental distinct order for EACH provider (e.g. 1,2,3,4...)
  // then uniqueOrders.length == activeProviders.length and each order group size === 1.
  // In that case, if there are many providers (we choose > 3 as heuristic),
  // assume these are parallel providers (Regular_Login) rather than multi-step.
  const everyGroupSingle = uniqueOrders.every(ord => (orderMap.get(ord)!.length === 1));
  const treatAsParallelFallback = (everyGroupSingle && uniqueOrders.length > 3);

  // ---------- CASE: Regular Login ----------
  if (uniqueOrders.length === 1 || treatAsParallelFallback) {
    // treat everything as parallel providers (Regular Login)
    this.form.patchValue({ mode: 'Regular_Login' });

    // types = list of types present; name = list of provider ids (all active)
    this.form.get('general')!.patchValue({
      type: allTypes,
      name: allIds
    }, { emitEvent: false });

    // update local options and preserve any existing selections
    this.onGeneralTypeChange(allTypes);
    return;
  }

  // ---------- CASE: Two Factor (exactly 2 order groups) ----------
  if (uniqueOrders.length === 2) {
    this.form.patchValue({ mode: 'Two_Factor_Authentication' });

    // clear existing rows then add one row per order-group (use first provider in each group as representative)
    this.twoFactor.clear();

    for (const ord of uniqueOrders) {
      const group = orderMap.get(ord)!;
      const rep = group[0]; // representative provider for this step
      this.addTwoFactorRow({ type: rep.type, nameId: rep.id });
    }

    return;
  }

  // ---------- CASE: Multi Factor (> 2 order groups) ----------
  if (uniqueOrders.length > 2) {
    this.form.patchValue({ mode: 'Multi_Factor' });

    this.multiFactor.clear();

    for (const ord of uniqueOrders) {
      const group = orderMap.get(ord)!;
      const rep = group[0]; // representative provider for this step
      this.addMultiRow({ type: rep.type, nameId: rep.id });
    }

    return;
  }

  // Fallback: if nothing matched, keep default (General) but do not prefill
  // (shouldn't reach here)
}

  generalNamesOptions: Array<{label:string,value:number}> = [];
  // ------------------ GENERAL HANDLERS ------------------
private onGeneralTypeChange(types: string[]) {

  const general = this.form.get('general') as FormGroup;

  if (!types || !types.length) {
    this.generalNamesOptions = [];
    general.get('name')!.setValue([]);
    return;
  }

  const providers = this.authProvidersData.filter(p =>
    types.includes(p.type)
  );

  this.generalNamesOptions = providers.map(p => ({
    label: p.name,
    value: p.id
  }));

  const current = general.get('name')!.value || [];

  const valid = current.filter((id:number) =>
    this.generalNamesOptions.some(p => p.value === id)
  );

  general.get('name')!.setValue(valid);
}

  // ------------------ FORM ARRAY HELPERS ------------------
  get twoFactor(): FormArray { return this.form.get('twoFactor') as FormArray; }
  get multiFactor(): FormArray { return this.form.get('multiFactor') as FormArray; }

  private createRow(initial?: { type?: string; nameId?: number }) {
    const g = this.fb.group({
      type: [initial?.type ?? null, Validators.required],
      name: [initial?.nameId ?? null, Validators.required]
    });

    // when type changes on this row, clear/patch the name for that row
    g.get('type')!.valueChanges.subscribe((type: string | null) => {
      const nameCtrl = g.get('name')!;
      if (!type) {
        nameCtrl.setValue(null);
        return;
      }
      const providers = this.namesByTypeMap[type] ?? [];
      const exists = providers.some(p => p.value === nameCtrl.value);
      if (!exists) {
        nameCtrl.setValue(providers.length ? providers[0].value : null);
      }
    });

    return g;
  }

  addTwoFactorRow(initial?: { type?: string; nameId?: number }) {
    this.twoFactor.push(this.createRow(initial));
  }

  addMultiRow(initial?: { type?: string; nameId?: number }) {
    this.multiFactor.push(this.createRow(initial));
  }

  removeTwoFactorRow(index: number) {
  if (this.twoFactor.length > 2) {
    this.twoFactor.removeAt(index);
  }
}

removeMultiRow(index: number) {
  if (this.multiFactor.length > 3) {
    this.multiFactor.removeAt(index);
  }
}

  // ------------------ BUILD FROM PROVIDERS ------------------
  private buildTwoFactorFromProviders(providers: Provider[]) {
    this.twoFactor.clear();
    providers.forEach(p => this.addTwoFactorRow({ type: p.type, nameId: p.id }));
    // ensure exactly 2 rows if not enough, add empties
    while (this.twoFactor.length < 2) this.addTwoFactorRow();
  }

  private buildMultiFactorFromProviders(providers: Provider[]) {
    this.multiFactor.clear();
    providers.forEach(p => this.addMultiRow({ type: p.type, nameId: p.id }));
    if (this.multiFactor.length === 0) this.addMultiRow(); // at least one row
  }

  private onModeChange(mode: string) {

  const general = this.form.get('general') as FormGroup;

  const typeCtrl = general.get('type')!;
  const nameCtrl = general.get('name')!;

  if (mode === 'Regular_Login') {

    // enable general validation
    typeCtrl.setValidators([Validators.required]);
    nameCtrl.setValidators([Validators.required]);

    // disable others
    this.twoFactor.clear();
    this.multiFactor.clear();

  }

  if (mode === 'Two_Factor_Authentication') {

    // disable general validation
    typeCtrl.clearValidators();
    nameCtrl.clearValidators();
    typeCtrl.setValue([]);
    nameCtrl.setValue([]);

    typeCtrl.updateValueAndValidity();
    nameCtrl.updateValueAndValidity();

    if (this.twoFactor.length === 0) {
      this.addTwoFactorRow();
      this.addTwoFactorRow();
    }

    this.multiFactor.clear();
  }

  if (mode === 'Multi_Factor') {

    // disable general validation
    typeCtrl.clearValidators();
    nameCtrl.clearValidators();
    typeCtrl.setValue([]);
    nameCtrl.setValue([]);

    typeCtrl.updateValueAndValidity();
    nameCtrl.updateValueAndValidity();

    if (this.multiFactor.length === 0) {
      this.addMultiRow();
    }

    this.twoFactor.clear();
  }

}

isSubmitDisabled(): boolean {

  const mode = this.form.get('mode')?.value;

  if (mode === 'Regular_Login') {

    const names = this.form.get('general.name')?.value || [];

    return names.length < 1;

  }

  if (mode === 'Two_Factor_Authentication') {

    if (this.twoFactor.length !== 2) return true;

    return this.twoFactor.controls.some(c => !c.valid);

  }

  if (mode === 'Multi_Factor') {

    if (this.multiFactor.length < 3) return true;

    return this.multiFactor.controls.some(c => !c.valid);

  }

  return true;
}

getAvailableNames(type: string | null, index: number, mode: 'two' | 'multi') {

  if (!type) return [];

  const allProviders = this.namesByTypeMap[type] || [];

  let selectedIds: number[] = [];

  if (mode === 'two') {

    selectedIds = this.twoFactor.controls
      .map((c, i) => i !== index ? c.get('name')?.value : null)
      .filter(v => v !== null);

  }

  if (mode === 'multi') {

    selectedIds = this.multiFactor.controls
      .map((c, i) => i !== index ? c.get('name')?.value : null)
      .filter(v => v !== null);

  }

  return allProviders.filter(p => !selectedIds.includes(p.value));
}



submit() {

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const formValue = this.form.value;

  const providers = this.authProvidersData.map(p => ({
    ...p,
    isActive: 0,
    order: 0 as number
  }));

  let selectedIds: number[] = [];

  if (formValue.mode === 'Regular_Login') {
    selectedIds = formValue.general.name;
  }

  if (formValue.mode === 'Two_Factor_Authentication') {
    selectedIds = formValue.twoFactor.map((x: any) => x.name);
  }

  if (formValue.mode === 'Multi_Factor') {
    selectedIds = formValue.multiFactor.map((x: any) => x.name);
  }

  selectedIds.forEach((id, index) => {

    const provider = providers.find(p => p.id === id);

    if (provider) {

      provider.isActive = 1;

      // ⭐ ORDER FIX
      if (formValue.mode === 'Regular_Login') {
        provider.order = 1; // all same
      } else {
        provider.order = index + 1; // step order
      }

    }

  });

  const payload = providers.map(p => ({
    id: p.id,
    isActive: p.isActive,
    order: p.order
  }));

  console.log(payload);

  this.loginService.updateAuthProviders(payload).subscribe({
    next: (res) => {
      console.log("Update successful", res);
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Authentication providers updated successfully.'});
    },
    error: (err) => {
      console.error("Update failed", err);
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to update authentication providers. Please try again.'});
    }
  });

}
}

