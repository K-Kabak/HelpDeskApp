PS C:\Users\kacpe\Documents\GitHub\HelpDeskApp> pnpm exec tsc --noEmit
e2e/admin-teams.spec.ts:37:24 - error TS2339: Property 'getByDisplayValue' does not exist on type 'Page'.

37     const input = page.getByDisplayValue(/./); // Find the input with current team name
                          ~~~~~~~~~~~~~~~~~

e2e/bulk-actions.spec.ts:26:17 - error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.

26       test.skip("Not enough tickets to test bulk actions");
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


e2e/bulk-actions.spec.ts:64:17 - error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.

64       test.skip("Not enough tickets to test bulk actions");
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


e2e/bulk-actions.spec.ts:104:17 - error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.

104       test.skip("No tickets to test bulk actions");
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


e2e/bulk-actions.spec.ts:133:17 - error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.

133       test.skip("No tickets to test bulk actions");
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


e2e/bulk-actions.spec.ts:161:17 - error TS2769: No overload matches this call.
  Overload 1 of 5, '(condition: boolean, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'boolean'.
  Overload 2 of 5, '(callback: ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>, description?: string | undefined): void', gave the following error.
    Argument of type 'string' is not assignable to parameter of type 'ConditionBody<PlaywrightTestArgs & PlaywrightTestOptions & PlaywrightWorkerArgs & PlaywrightWorkerOptions>'.

161       test.skip("No tickets to test bulk actions");
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


src/app/api/admin/automation-rules/[id]/route.ts:99:5 - error TS2322: Type 'Partial<{ name: string; enabled: boolean; triggerConfig: unknown; actionConfig: unknown; }>' is not assignable to type 'Exact<(Without<AutomationRuleUpdateInput, AutomationRuleUncheckedUpdateInput> & AutomationRuleUncheckedUpdateInput) | (Without<...> & AutomationRuleUpdateInput), (Without<...> & AutomationRuleUncheckedUpdateInput) | (Without<...> & AutomationRuleUpdateInput)>'.
  Type 'Partial<{ name: string; enabled: boolean; triggerConfig: unknown; actionConfig: unknown; }>' is not assignable to type '{ organizationId?: undefined; id?: Exact<string | StringFieldUpdateOperationsInput | undefined, string | StringFieldUpdateOperationsInput | undefined>; ... 6 more ...; organization?: Exact<...>; }'.
    Types of property 'triggerConfig' are incompatible.
      Type 'unknown' is not assignable to type 'Exact<InputJsonValue | JsonNull | undefined, InputJsonValue | JsonNull | undefined>'.

99     data: updateData,
       ~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:22402:5
    22402     data: XOR<AutomationRuleUpdateInput, AutomationRuleUncheckedUpdateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AutomationRuleSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AutomationRuleSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; where: Exact<...>; }'

src/app/api/admin/automation-rules/route.ts:66:7 - error TS2322: Type 'unknown' is not assignable to type 'string | number | boolean | JsonNull | InputJsonObject | InputJsonArray | { toJSON(): unknown; } | {} | { readonly [x: string]: Exact<InputJsonValue | null | undefined, InputJsonValue | ... 1 more ... | undefined>; } | { ...; } | { ...; }'.

66       triggerConfig: parsed.data.triggerConfig,
         ~~~~~~~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:29892:5
    29892     triggerConfig: JsonNullValueInput | InputJsonValue
              ~~~~~~~~~~~~~
    The expected type comes from property 'triggerConfig' which is declared here on type 'Exact<(Without<AutomationRuleCreateInput, AutomationRuleUncheckedCreateInput> & AutomationRuleUncheckedCreateInput) | (Without<...> & AutomationRuleCreateInput), (Without<...> & AutomationRuleUncheckedCreateInput) | (Without<...> & AutomationRuleCreateInput)>'

src/app/api/admin/automation-rules/route.ts:67:7 - error TS2322: Type 'unknown' is not assignable to type 'string | number | boolean | JsonNull | InputJsonObject | InputJsonArray | { toJSON(): unknown; } | {} | { readonly [x: string]: Exact<InputJsonValue | null | undefined, InputJsonValue | ... 1 more ... | undefined>; } | { ...; } | { ...; }'.

67       actionConfig: parsed.data.actionConfig,
         ~~~~~~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:29893:5
    29893     actionConfig: JsonNullValueInput | InputJsonValue
              ~~~~~~~~~~~~
    The expected type comes from property 'actionConfig' which is declared here on type 'Exact<(Without<AutomationRuleCreateInput, AutomationRuleUncheckedCreateInput> & AutomationRuleUncheckedCreateInput) | (Without<...> & AutomationRuleCreateInput), (Without<...> & AutomationRuleUncheckedCreateInput) | (Without<...> & AutomationRuleCreateInput)>'

src/app/api/admin/teams/[id]/memberships/route.ts:12:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

12   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:13:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

13   if (!session?.user || session.user.role !== "ADMIN") {
                                        ~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:29:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

29         organizationId: session.user.organizationId,
                                        ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:41:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

41         organizationId: session.user.organizationId,
                                        ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:84:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

84         adminId: session.user.id,
           ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/admin/teams/[id]/memberships/route.ts:84:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

84         adminId: session.user.id,
                                 ~~

src/app/api/admin/teams/[id]/memberships/route.ts:123:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

123   const session = await getServerSession(authOptions);
                                             ~~~~~~~~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:124:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

124   if (!session?.user || session.user.role !== "ADMIN") {
                                         ~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:140:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

140         organizationId: session.user.organizationId,
                                         ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:152:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

152         organizationId: session.user.organizationId,
                                         ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/memberships/route.ts:187:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

187         adminId: session.user.id,
            ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/admin/teams/[id]/memberships/route.ts:187:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

187         adminId: session.user.id,
                                  ~~

src/app/api/admin/teams/[id]/route.ts:12:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

12   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/admin/teams/[id]/route.ts:13:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

13   if (!session?.user || session.user.role !== "ADMIN") {
                                        ~~~~

src/app/api/admin/teams/[id]/route.ts:21:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

21         organizationId: session.user.organizationId,
                                        ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/route.ts:86:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

86   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/admin/teams/[id]/route.ts:87:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

87   if (!session?.user || session.user.role !== "ADMIN") {
                                        ~~~~

src/app/api/admin/teams/[id]/route.ts:110:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

110         organizationId: session.user.organizationId,
                                         ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/route.ts:123:40 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

123           organizationId: session.user.organizationId,
                                           ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/route.ts:142:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

142         adminId: session.user.id,
            ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/admin/teams/[id]/route.ts:142:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

142         adminId: session.user.id,
                                  ~~

src/app/api/admin/teams/[id]/route.ts:170:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

170   const session = await getServerSession(authOptions);
                                             ~~~~~~~~~~~

src/app/api/admin/teams/[id]/route.ts:171:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

171   if (!session?.user || session.user.role !== "ADMIN") {
                                         ~~~~

src/app/api/admin/teams/[id]/route.ts:180:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

180         organizationId: session.user.organizationId,
                                         ~~~~~~~~~~~~~~

src/app/api/admin/teams/[id]/route.ts:216:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

216         adminId: session.user.id,
            ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/admin/teams/[id]/route.ts:216:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

216         adminId: session.user.id,
                                  ~~

src/app/api/admin/teams/route.ts:8:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

8   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/api/admin/teams/route.ts:9:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

9   if (!session?.user || session.user.role !== "ADMIN") {
                                       ~~~~

src/app/api/admin/teams/route.ts:15:45 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

15       where: { organizationId: session.user.organizationId },
                                               ~~~~~~~~~~~~~~

src/app/api/admin/teams/route.ts:51:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

51   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/admin/teams/route.ts:52:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

52   if (!session?.user || session.user.role !== "ADMIN") {
                                        ~~~~

src/app/api/admin/teams/route.ts:75:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

75         organizationId: session.user.organizationId,
                                        ~~~~~~~~~~~~~~

src/app/api/admin/teams/route.ts:87:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

87         organizationId: session.user.organizationId!,
                                        ~~~~~~~~~~~~~~

src/app/api/admin/teams/route.ts:94:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

94         adminId: session.user.id,
           ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/admin/teams/route.ts:94:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

94         adminId: session.user.id,
                                 ~~

src/app/api/admin/users/[id]/route.ts:5:10 - error TS2300: Duplicate identifier 'Role'.

5 import { Role, Prisma } from "@prisma/client";
           ~~~~

src/app/api/admin/users/[id]/route.ts:6:10 - error TS2300: Duplicate identifier 'Role'.

6 import { Role } from "@prisma/client";
           ~~~~

src/app/api/admin/users/[id]/route.ts:15:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

15   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/admin/users/[id]/route.ts:16:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

16   if (!session?.user || session.user.role !== "ADMIN") {
                                        ~~~~

src/app/api/admin/users/[id]/route.ts:24:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

24         organizationId: session.user.organizationId,
                                        ~~~~~~~~~~~~~~

src/app/api/admin/users/[id]/route.ts:78:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

78   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/admin/users/[id]/route.ts:79:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

79   if (!session?.user || session.user.role !== "ADMIN") {
                                        ~~~~

src/app/api/admin/users/[id]/route.ts:100:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

100         organizationId: session.user.organizationId,
                                         ~~~~~~~~~~~~~~

src/app/api/admin/users/[id]/route.ts:144:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

144         adminId: session.user.id,
            ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/admin/users/[id]/route.ts:144:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

144         adminId: session.user.id,
                                  ~~

src/app/api/admin/users/[id]/route.ts:172:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

172   const session = await getServerSession(authOptions);
                                             ~~~~~~~~~~~

src/app/api/admin/users/[id]/route.ts:173:38 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

173   if (!session?.user || session.user.role !== "ADMIN") {
                                         ~~~~

src/app/api/admin/users/[id]/route.ts:182:38 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

182         organizationId: session.user.organizationId,
                                         ~~~~~~~~~~~~~~

src/app/api/admin/users/[id]/route.ts:211:42 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

211     if (existingUser.id === session.user.id) {
                                             ~~

src/app/api/admin/users/[id]/route.ts:225:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

225         adminId: session.user.id,
            ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/admin/users/[id]/route.ts:225:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

225         adminId: session.user.id,
                                  ~~

src/app/api/admin/users/[id]/route.ts:228:26 - error TS2339: Property 'id' does not exist on type 'Promise<{ id: string; }>'.

228         entityId: params.id,
                             ~~

  src/app/api/admin/users/[id]/route.ts:228:26
    228         entityId: params.id,
                                 ~~
    Did you forget to use 'await'?

src/app/api/admin/users/route.ts:37:16 - error TS2322: Type 'string | null | undefined' is not assignable to type 'Exact<string | StringFilter<"User"> | undefined, string | StringFilter<"User"> | undefined>'.
  Type 'null' is not assignable to type 'Exact<string | StringFilter<"User"> | undefined, string | StringFilter<"User"> | undefined>'.

37       where: { organizationId: auth.user.organizationId },
                  ~~~~~~~~~~~~~~

src/app/api/admin/users/route.ts:70:25 - error TS2339: Property '_count' does not exist on type '{ id: string; name: string; email: string; passwordHash: string; emailVerified: Date | null; role: Role; organizationId: string; createdAt: Date; updatedAt: Date; }'.

70       ticketCount: user._count.ticketsCreated,
                           ~~~~~~

src/app/api/admin/users/route.ts:71:31 - error TS2339: Property '_count' does not exist on type '{ id: string; name: string; email: string; passwordHash: string; emailVerified: Date | null; role: Role; organizationId: string; createdAt: Date; updatedAt: Date; }'.

71       activeTicketCount: user._count.ticketsOwned,
                                 ~~~~~~

src/app/api/admin/users/route.ts:83:25 - error TS2304: Cannot find name 'getServerSession'.

83   const session = await getServerSession(authOptions);
                           ~~~~~~~~~~~~~~~~

src/app/api/admin/users/route.ts:83:42 - error TS2304: Cannot find name 'authOptions'.

83   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/admin/users/route.ts:141:9 - error TS2353: Object literal may only specify known properties, and 'adminId' does not exist in type 'Exact<(Without<AdminAuditCreateInput, AdminAuditUncheckedCreateInput> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput), (Without<...> & AdminAuditUncheckedCreateInput) | (Without<...> & AdminAuditCreateInput)>'.

141         adminId: session.user.id,
            ~~~~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:15525:5
    15525     data: XOR<AdminAuditCreateInput, AdminAuditUncheckedCreateInput>
              ~~~~
    The expected type comes from property 'data' which is declared here on type '{ select?: Exact<AdminAuditSelect<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }> | null | undefined, AdminAuditSelect<InternalArgs & { ...; }> | null | undefined>; include?: Exact<...>; data: Exact<...>; }'

src/app/api/notifications/[id]/read/route.ts:11:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

11   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/notifications/[id]/read/route.ts:23:30 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

23         userId: session.user.id,
                                ~~

src/app/api/notifications/route.ts:48:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

48   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/notifications/route.ts:57:35 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

57     where: { userId: session.user.id },
                                     ~~

src/app/api/reports/csat/route.ts:14:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

14   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/reports/csat/route.ts:15:23 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

15   if (!session?.user?.organizationId) {
                         ~~~~~~~~~~~~~~

src/app/api/reports/csat/route.ts:20:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

20   if (session.user.role !== "ADMIN") {
                      ~~~~

src/app/api/reports/csat/route.ts:24:39 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

24   const organizationId = session.user.organizationId;
                                         ~~~~~~~~~~~~~~

src/app/api/reports/export/comments/route.ts:18:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

18   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/reports/export/comments/route.ts:19:23 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

19   if (!session?.user?.organizationId) {
                         ~~~~~~~~~~~~~~

src/app/api/reports/export/comments/route.ts:30:36 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

30   const isRequester = session.user.role === "REQUESTER";
                                      ~~~~

src/app/api/reports/export/comments/route.ts:35:5 - error TS2561: Object literal may only specify known properties, but 'internal' does not exist in type 'CommentWhereInput'. Did you mean to write 'isInternal'?

35     internal: includeInternal ? undefined : false, // Requesters only see public comments
       ~~~~~~~~

src/app/api/reports/export/comments/route.ts:40:22 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

40     id: session.user.id,
                        ~~

src/app/api/reports/export/comments/route.ts:41:24 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

41     role: session.user.role ?? "REQUESTER",
                          ~~~~

src/app/api/reports/export/comments/route.ts:42:34 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

42     organizationId: session.user.organizationId,
                                    ~~~~~~~~~~~~~~

src/app/api/reports/export/comments/route.ts:50:9 - error TS2322: Type 'string | null' is not assignable to type 'Exact<string | StringFilter<"Ticket"> | undefined, string | StringFilter<"Ticket"> | undefined>'.
  Type 'null' is not assignable to type 'Exact<string | StringFilter<"Ticket"> | undefined, string | StringFilter<"Ticket"> | undefined>'.

50         id: ticketIdParam,
           ~~

src/app/api/reports/export/comments/route.ts:63:7 - error TS2322: Type '{ requesterId: string; id?: undefined; organizationId?: undefined; } | { id: null; requesterId?: undefined; organizationId?: undefined; } | { organizationId: string; requesterId?: undefined; id?: undefined; }' is not assignable to type 'Exact<TicketWhereInput | undefined, TicketWhereInput | undefined>'.
  Type '{ id: null; requesterId?: undefined; organizationId?: undefined; }' is not assignable to type 'Exact<TicketWhereInput | undefined, TicketWhereInput | undefined>'.
    Type '{ id: null; requesterId?: undefined; organizationId?: undefined; }' is not assignable to type '{ AND?: Exact<TicketWhereInput | TicketWhereInput[] | undefined, TicketWhereInput | TicketWhereInput[] | undefined>; ... 33 more ...; csatResponse?: Exact<...>; }'.
      Types of property 'id' are incompatible.
        Type 'null' is not assignable to type 'Exact<string | StringFilter<"Ticket"> | undefined, string | StringFilter<"Ticket"> | undefined>'.

63       where: ticketScopeClause,
         ~~~~~

src/app/api/reports/export/comments/route.ts:117:33 - error TS2551: Property 'internal' does not exist on type '{ ticket: { number: number; title: string; }; author: { name: string; email: string; }; } & { id: string; createdAt: Date; ticketId: string; authorId: string; isInternal: boolean; bodyMd: string; }'. Did you mean 'isInternal'?

117     const commentBody = comment.internal && isRequester ? "[Internal Comment - Hidden]" : comment.body;
                                    ~~~~~~~~

src/app/api/reports/export/comments/route.ts:117:99 - error TS2339: Property 'body' does not exist on type '{ ticket: { number: number; title: string; }; author: { name: string; email: string; }; } & { id: string; createdAt: Date; ticketId: string; authorId: string; isInternal: boolean; bodyMd: string; }'.

117     const commentBody = comment.internal && isRequester ? "[Internal Comment - Hidden]" : comment.body;
                                                                                                      ~~~~

src/app/api/reports/export/comments/route.ts:125:15 - error TS2551: Property 'internal' does not exist on type '{ ticket: { number: number; title: string; }; author: { name: string; email: string; }; } & { id: string; createdAt: Date; ticketId: string; authorId: string; isInternal: boolean; bodyMd: string; }'. Did you mean 'isInternal'?

125       comment.internal ? "Yes" : "No",
                  ~~~~~~~~

src/app/api/reports/export/tickets/route.ts:21:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

21   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/reports/export/tickets/route.ts:27:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

27   if (session.user.role === "REQUESTER") {
                      ~~~~

src/app/api/reports/export/tickets/route.ts:44:20 - error TS2345: Argument of type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }' is not assignable to parameter of type 'AuthenticatedUser'.
  Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }' is missing the following properties from type 'AuthenticatedUser': id, role

44     ...ticketScope(session.user),
                      ~~~~~~~~~~~~

src/app/api/reports/export/tickets/route.ts:77:5 - error TS2322: Type '{ createdAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; tags?: { some: { tagId: { in: string[]; }; }; } | undefined; category?: string | undefined; OR?: ({ title: { ...; }; descriptionMd?: undefined; } | { ...; })[] | undefined; ... 4 more ...; organizationId?: undefined; } | { ...; } | { ...; }' is not assignable to type 'Exact<TicketWhereInput | undefined, TicketWhereInput | undefined>'.
  Type '{ createdAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; tags?: { some: { tagId: { in: string[]; }; }; } | undefined; category?: string | undefined; OR?: ({ title: { ...; }; descriptionMd?: undefined; } | { ...; })[] | undefined; ... 4 more ...; organizationId?: undefined; }' is not assignable to type 'Exact<TicketWhereInput | undefined, TicketWhereInput | undefined>'.
    Type '{ createdAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; tags?: { some: { tagId: { in: string[]; }; }; } | undefined; category?: string | undefined; OR?: ({ title: { ...; }; descriptionMd?: undefined; } | { ...; })[] | undefined; ... 4 more ...; organizationId?: undefined; }' is not assignable to type '{ AND?: Exact<TicketWhereInput | TicketWhereInput[] | undefined, TicketWhereInput | TicketWhereInput[] | undefined>; ... 33 more ...; csatResponse?: Exact<...>; }'.
      Types of property 'id' are incompatible.
        Type 'null' is not assignable to type 'Exact<string | StringFilter<"Ticket"> | undefined, string | StringFilter<"Ticket"> | undefined>'.

77     where,
       ~~~~~

src/app/api/reports/export/tickets/route.ts:101:40 - error TS2345: Argument of type '{ number: number; category: string | null; id: string; organizationId: string; createdAt: Date; updatedAt: Date; status: TicketStatus; requesterId: string; resolvedAt: Date | null; ... 12 more ...; lastReopenedAt: Date | null; }[]' is not assignable to parameter of type '{ number: number; title: string; status: TicketStatus; priority: TicketPriority; category: string | null; requester: { email: string; name: string | null; } | null; ... 6 more ...; updatedAt: Date; }[]'.
  Type '{ number: number; category: string | null; id: string; organizationId: string; createdAt: Date; updatedAt: Date; status: TicketStatus; requesterId: string; resolvedAt: Date | null; ... 12 more ...; lastReopenedAt: Date | null; }' is missing the following properties from type '{ number: number; title: string; status: TicketStatus; priority: TicketPriority; category: string | null; requester: { email: string; name: string | null; } | null; ... 6 more ...; updatedAt: Date; }': requester, assigneeUser, assigneeTeam

101   const csvContent = generateTicketCsv(tickets);
                                           ~~~~~~~

src/app/api/reports/kpi/route.ts:7:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

7   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/api/reports/kpi/route.ts:8:23 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

8   if (!session?.user?.organizationId) {
                        ~~~~~~~~~~~~~~

src/app/api/reports/kpi/route.ts:13:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

13   if (session.user.role !== "ADMIN") {
                      ~~~~

src/app/api/reports/kpi/route.ts:17:39 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

17   const organizationId = session.user.organizationId;
                                         ~~~~~~~~~~~~~~

src/app/api/tickets/[id]/attachments/route.ts:23:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

23   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/tickets/[id]/attachments/route.ts:31:26 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

31     userId: session.user.id,
                            ~~

src/app/api/tickets/[id]/attachments/route.ts:36:30 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

36     identifier: session.user.id,
                                ~~

src/app/api/tickets/[id]/attachments/route.ts:64:57 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

64   if (!ticket || ticket.organizationId !== session.user.organizationId) {
                                                           ~~~~~~~~~~~~~~

src/app/api/tickets/[id]/attachments/route.ts:68:36 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

68   const isRequester = session.user.role === "REQUESTER";
                                      ~~~~

src/app/api/tickets/[id]/attachments/route.ts:70:58 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

70   if (isRequester && ticket.requesterId !== session.user.id) {
                                                            ~~

src/app/api/tickets/[id]/attachments/route.ts:87:32 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

87       uploaderId: session.user.id,
                                  ~~

src/app/api/tickets/[id]/attachments/route.ts:98:27 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

98     actorId: session.user.id,
                             ~~

src/app/api/tickets/[id]/attachments/route.ts:130:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

130   const session = await getServerSession(authOptions);
                                             ~~~~~~~~~~~

src/app/api/tickets/[id]/attachments/route.ts:138:26 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

138     userId: session.user.id,
                             ~~

src/app/api/tickets/[id]/attachments/route.ts:156:55 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

156     attachment.ticket.organizationId !== session.user.organizationId ||
                                                          ~~~~~~~~~~~~~~

src/app/api/tickets/[id]/attachments/route.ts:163:18 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

163     session.user.role === "AGENT" || session.user.role === "ADMIN";
                     ~~~~

src/app/api/tickets/[id]/attachments/route.ts:163:51 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

163     session.user.role === "AGENT" || session.user.role === "ADMIN";
                                                      ~~~~

src/app/api/tickets/[id]/attachments/route.ts:164:36 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

164   const isRequester = session.user.role === "REQUESTER";
                                       ~~~~

src/app/api/tickets/[id]/attachments/route.ts:167:67 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

167     isRequester && attachment.ticket.requesterId === session.user.id;
                                                                      ~~

src/app/api/tickets/[id]/attachments/route.ts:168:68 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

168   const requesterUploaded = attachment.uploaderId === session.user.id;
                                                                       ~~

src/app/api/tickets/[id]/attachments/route.ts:182:18 - error TS18048: 'session.user' is possibly 'undefined'.

182         actorId: session.user.id,
                     ~~~~~~~~~~~~

src/app/api/tickets/[id]/attachments/route.ts:182:31 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

182         actorId: session.user.id,
                                  ~~

src/app/api/tickets/[id]/audit/route.ts:11:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

11   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/api/tickets/[id]/audit/route.ts:31:18 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

31     session.user.role === "REQUESTER" &&
                    ~~~~

src/app/api/tickets/[id]/audit/route.ts:32:41 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

32     ticket.requesterId !== session.user.id
                                           ~~

src/app/api/tickets/[id]/audit/route.ts:39:18 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

39     session.user.role !== "REQUESTER" &&
                    ~~~~

src/app/api/tickets/[id]/audit/route.ts:40:44 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

40     ticket.organizationId !== session.user.organizationId
                                              ~~~~~~~~~~~~~~

src/app/api/tickets/[id]/csat/route.ts:67:9 - error TS18047: 'csatRequest.expiresAt' is possibly 'null'.

67     if (csatRequest.expiresAt < new Date()) {
           ~~~~~~~~~~~~~~~~~~~~~

src/app/api/tickets/[id]/route.ts:66:43 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

66   const session = (await getServerSession(authOptions)) as SessionWithUser | null;
                                             ~~~~~~~~~~~

src/app/app/admin/audit/page.tsx:7:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

7   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/app/admin/audit/page.tsx:11:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

11   if (session.user.role !== "ADMIN") {
                      ~~~~

src/app/app/admin/automation-rules/page.tsx:8:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

8   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/app/admin/automation-rules/page.tsx:12:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

12   if (session.user.role !== "ADMIN") {
                      ~~~~

src/app/app/admin/automation-rules/page.tsx:18:45 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

18       where: { organizationId: session.user.organizationId ?? "" },
                                               ~~~~~~~~~~~~~~

src/app/app/admin/automation-rules/page.tsx:22:45 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

22       where: { organizationId: session.user.organizationId ?? "" },
                                               ~~~~~~~~~~~~~~

src/app/app/admin/automation-rules/page.tsx:27:45 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

27       where: { organizationId: session.user.organizationId ?? "" },
                                               ~~~~~~~~~~~~~~

src/app/app/admin/automation-rules/page.tsx:65:9 - error TS2322: Type '{ id: string; name: string; enabled: boolean; triggerConfig: Record<string, unknown>; actionConfig: Record<string, unknown>; createdAt: Date; updatedAt: Date; }[]' is not assignable to type 'AutomationRule[]'.
  Type '{ id: string; name: string; enabled: boolean; triggerConfig: Record<string, unknown>; actionConfig: Record<string, unknown>; createdAt: Date; updatedAt: Date; }' is not assignable to type 'AutomationRule'.
    Types of property 'triggerConfig' are incompatible.
      Type 'Record<string, unknown>' is not assignable to type '{ type: "ticketCreated"; } | { type: "ticketUpdated"; } | { type: "statusChanged"; status: "NOWE" | "W_TOKU" | "OCZEKUJE_NA_UZYTKOWNIKA" | "WSTRZYMANE" | "ROZWIAZANE" | "ZAMKNIETE" | "PONOWNIE_OTWARTE"; } | { ...; }'.
        Type 'Record<string, unknown>' is missing the following properties from type '{ type: "priorityChanged"; priority: "NISKI" | "SREDNI" | "WYSOKI" | "KRYTYCZNY"; }': type, priority

65         initialRules={mappedRules}
           ~~~~~~~~~~~~

  src/app/app/admin/automation-rules/automation-rules-manager.tsx:43:3
    43   initialRules: AutomationRule[];
         ~~~~~~~~~~~~
    The expected type comes from property 'initialRules' which is declared here on type 'IntrinsicAttributes & Props'

src/app/app/admin/sla-policies/page.tsx:8:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

8   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/app/admin/sla-policies/page.tsx:12:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

12   if (session.user.role !== "ADMIN") {
                      ~~~~

src/app/app/admin/sla-policies/page.tsx:18:45 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

18       where: { organizationId: session.user.organizationId ?? "" },
                                               ~~~~~~~~~~~~~~

src/app/app/admin/sla-policies/page.tsx:23:45 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

23       where: { organizationId: session.user.organizationId ?? "" },
                                               ~~~~~~~~~~~~~~

src/app/app/admin/teams/page.tsx:8:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

8   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/app/admin/teams/page.tsx:12:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

12   if (session.user.role !== "ADMIN") {
                      ~~~~

src/app/app/admin/teams/page.tsx:17:43 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

17     where: { organizationId: session.user.organizationId },
                                             ~~~~~~~~~~~~~~

src/app/app/admin/teams/page.tsx:46:43 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

46     where: { organizationId: session.user.organizationId },
                                             ~~~~~~~~~~~~~~

src/app/app/admin/users/page.tsx:8:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

8   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/app/admin/users/page.tsx:12:20 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

12   if (session.user.role !== "ADMIN") {
                      ~~~~

src/app/app/admin/users/page.tsx:17:43 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

17     where: { organizationId: session.user.organizationId },
                                             ~~~~~~~~~~~~~~

src/app/app/layout.tsx:7:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

7   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/app/layout.tsx:21:63 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

21       <Topbar userName={session.user.name} role={session.user.role} />
                                                                 ~~~~

src/app/app/notifications/page.tsx:9:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

9   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/app/app/notifications/page.tsx:15:35 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

15     where: { userId: session.user.id },
                                     ~~

src/app/app/notifications/page.tsx:32:28 - error TS2322: Type '{ id: string; body: string | null; createdAt: Date; userId: string; data: JsonValue; subject: string | null; readAt: Date | null; }[]' is not assignable to type 'Notification[]'.
  Type '{ id: string; body: string | null; createdAt: Date; userId: string; data: JsonValue; subject: string | null; readAt: Date | null; }' is not assignable to type 'Notification'.
    Types of property 'data' are incompatible.
      Type 'JsonValue' is not assignable to type 'Record<string, unknown> | null'.
        Type 'string' is not assignable to type 'Record<string, unknown>'.

32         <NotificationsList initialNotifications={notifications} />
                              ~~~~~~~~~~~~~~~~~~~~

  src/app/app/notifications/notifications-list.tsx:20:3
    20   initialNotifications: Notification[];
         ~~~~~~~~~~~~~~~~~~~~
    The expected type comes from property 'initialNotifications' which is declared here on type 'IntrinsicAttributes & Props'

src/app/app/page.tsx:231:5 - error TS2322: Type 'string | undefined' is not assignable to type 'TicketStatus | undefined'.
  Type 'string' is not assignable to type 'TicketStatus | undefined'.

231     status: statusFilter,
        ~~~~~~

src/app/app/page.tsx:232:5 - error TS2322: Type 'string | undefined' is not assignable to type 'TicketPriority | undefined'.
  Type 'string' is not assignable to type 'TicketPriority | undefined'.

232     priority: priorityFilter,
        ~~~~~~~~

src/app/app/page.tsx:411:8 - error TS2741: Property 'currentFilters' is missing in type '{ initialViews: { id: string; name: string; filters: { status?: TicketStatus | undefined; priority?: TicketPriority | undefined; search?: string | undefined; category?: string | undefined; tagIds?: string[] | undefined; }; isShared: boolean; isDefault: boolean; createdAt: string; updatedAt: string; }[]; }' but required in type 'SavedViewsProps'.

411       <SavedViews
           ~~~~~~~~~~

  src/app/app/saved-views.tsx:25:3
    25   currentFilters: {
         ~~~~~~~~~~~~~~
    'currentFilters' is declared here.

src/app/app/reports/page.tsx:98:43 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

98   const session = (await getServerSession(authOptions)) as SessionWithUser | null;
                                             ~~~~~~~~~~~

src/app/app/reports/page.tsx:136:54 - error TS2322: Type 'import("C:/Users/kacpe/Documents/GitHub/HelpDeskApp/src/lib/kpi-metrics").KpiMetrics | null' is not assignable to type 'KpiMetrics | null'.
  Type 'import("C:/Users/kacpe/Documents/GitHub/HelpDeskApp/src/lib/kpi-metrics").KpiMetrics' is not assignable to type 'KpiMetrics'.
    Types of property 'mttr' are incompatible.
      Type '{ averageHours: number; averageMinutes: number; totalResolved: number; } | null' is not assignable to type '{ averageHours: number; averageMinutes: number; totalResolved: number; } | undefined'.
        Type 'null' is not assignable to type '{ averageHours: number; averageMinutes: number; totalResolved: number; } | undefined'.

136   return <ReportsClient initialAnalytics={analytics} initialKpi={kpi} initialDays={validDays} />;
                                                         ~~~~~~~~~~

  src/app/app/reports/reports-client.tsx:52:15
    52   initialDays: number;
                     ~~~~~~~~
    53 }
       ~
    The expected type comes from property 'initialKpi' which is declared here on type 'IntrinsicAttributes & ReportsClientProps'

src/app/app/ticket-list.tsx:169:50 - error TS2345: Argument of type 'Ticket' is not assignable to parameter of type 'Pick<{ number: number; status: TicketStatus; title: string; category: string | null; id: string; organizationId: string; createdAt: Date; updatedAt: Date; priority: TicketPriority; ... 12 more ...; lastReopenedAt: Date | null; }, "status" | ... 4 more ... | "resolveDue">'.
  Type 'Ticket' is missing the following properties from type 'Pick<{ number: number; status: TicketStatus; title: string; category: string | null; id: string; organizationId: string; createdAt: Date; updatedAt: Date; priority: TicketPriority; ... 12 more ...; lastReopenedAt: Date | null; }, "status" | ... 4 more ... | "resolveDue">': resolvedAt, closedAt, firstResponseAt, firstResponseDue, resolveDue

169                         const sla = getSlaStatus(ticket);
                                                     ~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:38:19 - error TS2339: Property 'status' does not exist on type '{}'.

38       if (changes.status) {
                     ~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:39:49 - error TS2339: Property 'status' does not exist on type '{}'.

39         const statusChange = `Status: ${changes.status.old} → ${changes.status.new}`;
                                                   ~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:39:73 - error TS2339: Property 'status' does not exist on type '{}'.

39         const statusChange = `Status: ${changes.status.old} → ${changes.status.new}`;
                                                                           ~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:42:19 - error TS2339: Property 'priority' does not exist on type '{}'.

42       if (changes.priority) {
                     ~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:43:42 - error TS2339: Property 'priority' does not exist on type '{}'.

43         parts.push(`Priorytet: ${changes.priority.old} → ${changes.priority.new}`);
                                            ~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:43:68 - error TS2339: Property 'priority' does not exist on type '{}'.

43         parts.push(`Priorytet: ${changes.priority.old} → ${changes.priority.new}`);
                                                                      ~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:45:19 - error TS2339: Property 'assigneeUserId' does not exist on type '{}'.

45       if (changes.assigneeUserId) {
                     ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:46:33 - error TS2339: Property 'assigneeUserId' does not exist on type '{}'.

46         const oldUser = changes.assigneeUserId.old ? "przypisany" : "nieprzypisany";
                                   ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:47:33 - error TS2339: Property 'assigneeUserId' does not exist on type '{}'.

47         const newUser = changes.assigneeUserId.new ? "przypisany" : "nieprzypisany";
                                   ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:50:19 - error TS2339: Property 'assigneeTeamId' does not exist on type '{}'.

50       if (changes.assigneeTeamId) {
                     ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:51:33 - error TS2339: Property 'assigneeTeamId' does not exist on type '{}'.

51         const oldTeam = changes.assigneeTeamId.old ? "przypisany" : "nieprzypisany";
                                   ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:52:33 - error TS2339: Property 'assigneeTeamId' does not exist on type '{}'.

52         const newTeam = changes.assigneeTeamId.new ? "przypisany" : "nieprzypisany";
                                   ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:61:50 - error TS2339: Property 'fileName' does not exist on type '{}'.

61       return `Przesłano załącznik: ${attachment?.fileName || "plik"}`;
                                                    ~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:66:49 - error TS2339: Property 'fileName' does not exist on type '{}'.

66       return `Usunięto załącznik: ${attachment?.fileName || "plik"}`;
                                                   ~~~~~~~~

src/app/app/tickets/[id]/audit-timeline.tsx:176:19 - error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.

176                   {event.action === "TICKET_UPDATED" && event.data && typeof event.data === "object" && "reopenReason" in event.data && event.data.reopenReason && (
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
177                     <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
180                     </div>
    ~~~~~~~~~~~~~~~~~~~~~~~~~~
181                   )}
    ~~~~~~~~~~~~~~~~~~~~

src/app/app/tickets/[id]/page.tsx:49:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

49   const session = await getServerSession(authOptions);
                                            ~~~~~~~~~~~

src/app/app/tickets/[id]/page.tsx:73:18 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

73     session.user.role === "REQUESTER" &&
                    ~~~~

src/app/app/tickets/[id]/page.tsx:74:41 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

74     ticket.requesterId !== session.user.id
                                           ~~

src/app/app/tickets/[id]/page.tsx:84:18 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

84     session.user.role === "REQUESTER"
                    ~~~~

src/app/app/tickets/[id]/page.tsx:89:44 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

89               organizationId: session.user.organizationId,
                                              ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/page.tsx:96:51 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

96             where: { organizationId: session.user.organizationId },
                                                     ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/page.tsx:101:26 - error TS2339: Property 'organizationId' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

101             session.user.organizationId ?? "",
                             ~~~~~~~~~~~~~~

src/app/app/tickets/[id]/page.tsx:107:18 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

107     session.user.role === "REQUESTER"
                     ~~~~

src/app/app/tickets/[id]/page.tsx:115:39 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

115   const canSeeInternal = session.user.role !== "REQUESTER";
                                          ~~~~

src/app/app/tickets/[id]/page.tsx:118:18 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

118     session.user.role === "REQUESTER"
                     ~~~~

src/app/app/tickets/[id]/page.tsx:197:28 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

197         role={session.user.role as Role}
                               ~~~~

src/app/app/tickets/[id]/page.tsx:198:54 - error TS2339: Property 'id' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

198         isOwner={ticket.requesterId === session.user.id}
                                                         ~~

src/app/app/tickets/[id]/page.tsx:207:41 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

207         canUploadInternal={session.user.role !== "REQUESTER"}
                                            ~~~~

src/app/app/tickets/[id]/page.tsx:268:73 - error TS2339: Property 'role' does not exist on type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; }'.

268           <CommentForm ticketId={ticket.id} allowInternal={session.user.role !== "REQUESTER"} />
                                                                            ~~~~

src/app/page.tsx:6:42 - error TS2345: Argument of type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to parameter of type 'GetServerSessionParams<GetServerSessionOptions>'.
  Type '[{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }]' is not assignable to type '[GetServerSessionOptions]'.
    Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type 'GetServerSessionOptions'.
      Type '{ adapter: Adapter; session: { strategy: "jwt"; }; pages: { signIn: string; }; providers: CredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>[]; callbacks: { ...; }; }' is not assignable to type '{ callbacks?: (Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }) | undefined; }'.
        Types of property 'callbacks' are incompatible.
          Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type 'Omit<Partial<CallbacksOptions<Profile, Account>> | undefined, "session"> & { session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { ...; }) => any) | undefined; }'.
            Type '{ jwt({ token, user }: { token: JWT; user?: (User & AppUser) | undefined; }): Promise<JWT>; session({ session, token }: { session: Session; token: JWT; }): Promise<Session>; }' is not assignable to type '{ session?: ((params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any) | undefined; }'.
              Types of property 'session' are incompatible.
                Type '({ session, token }: { session: Session; token: JWT; }) => Promise<Session>' is not assignable to type '(params: { session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }) => any'.
                  Types of parameters '__0' and 'params' are incompatible.
                    Type '{ session: Session; token: JWT; user: AdapterUser; } & { newSession: any; trigger: "update"; }' is not assignable to type '{ session: Session; token: JWT; }'.
                      The types of 'session.user' are incompatible between these types.
                        Type '{ name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.
                          Type 'undefined' is not assignable to type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }'.

6   const session = await getServerSession(authOptions);
                                           ~~~~~~~~~~~

src/lib/auth.ts:10:5 - error TS2717: Subsequent property declarations must have the same type.  Property 'user' must be of type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role?: string | undefined; organizationId?: string | undefined; }', but here has type '{ id: string; name?: string | null | undefined; email?: string | null | undefined; role: string; organizationId: string; }'.

10     user: {
       ~~~~

  src/types/next-auth.d.ts:3:5
    3     user: {
          ~~~~
    'user' was also declared here.

src/lib/auth.ts:41:26 - error TS2345: Argument of type 'DynamicClientExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, TypeMapCb, { result: {}; model: {}; query: {}; client: {}; }, {}>' is not assignable to parameter of type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
  Type 'DynamicClientExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, TypeMapCb, { result: {}; model: {}; query: {}; client: {}; }, {}>' is missing the following properties from type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>': $on, $use

41   adapter: PrismaAdapter(prisma),
                            ~~~~~~

src/lib/auth.ts:88:17 - error TS2339: Property 'sub' does not exist on type 'JWT'.

88       if (token.sub && session.user) {
                   ~~~

src/lib/auth.ts:89:33 - error TS2339: Property 'sub' does not exist on type 'JWT'.

89         session.user.id = token.sub;
                                   ~~~

src/lib/authorization.test.ts:27:61 - error TS2503: Cannot find namespace 'vi'.

27 const mockGetServerSession = getServerSession as unknown as vi.Mock;
                                                               ~~

src/lib/authorization.test.ts:83:19 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

83     expect(result.response.status).toBe(401);
                     ~~~~~~~~

src/lib/authorization.test.ts:84:19 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

84     expect(result.response.body).toEqual({ error: "Unauthorized" });
                     ~~~~~~~~

src/lib/authorization.test.ts:99:19 - error TS2339: Property 'user' does not exist on type 'AuthResult'.
  Property 'user' does not exist on type '{ ok: false; response: NextResponse<unknown>; }'.

99     expect(result.user).toEqual({
                     ~~~~

src/lib/av-scanner.test.ts:17:27 - error TS2558: Expected 0-1 type arguments, but got 2.

17     const scanner = vi.fn<[], Promise<AvScanResult>>().mockResolvedValue({
                             ~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/av-scanner.test.ts:17:74 - error TS2345: Argument of type '{ status: string; }' is not assignable to parameter of type 'never'.

17     const scanner = vi.fn<[], Promise<AvScanResult>>().mockResolvedValue({
                                                                            ~
18       status: "clean",
   ~~~~~~~~~~~~~~~~~~~~~~
19     });
   ~~~~~

src/lib/av-scanner.test.ts:21:71 - error TS2345: Argument of type 'Mock<[]>' is not assignable to parameter of type 'AvScanner | undefined'.
  Type 'Mock<[]>' is not assignable to type 'AvScanner'.
    Types of parameters 'args' and 'filePath' are incompatible.
      Type '[filePath: string]' is not assignable to type 'never'.

21     const result = await runAttachmentScan("att-1", avFixtures.clean, scanner);
                                                                         ~~~~~~~

src/lib/av-scanner.test.ts:37:27 - error TS2558: Expected 0-1 type arguments, but got 2.

37     const scanner = vi.fn<[], Promise<AvScanResult>>().mockResolvedValue({
                             ~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/av-scanner.test.ts:37:74 - error TS2345: Argument of type '{ status: string; signature: string; }' is not assignable to parameter of type 'never'.

37     const scanner = vi.fn<[], Promise<AvScanResult>>().mockResolvedValue({
                                                                            ~
38       status: "infected",
   ~~~~~~~~~~~~~~~~~~~~~~~~~
39       signature: "EICAR_TEST_FILE",
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
40     });
   ~~~~~

src/lib/av-scanner.test.ts:42:59 - error TS2345: Argument of type 'Mock<[]>' is not assignable to parameter of type 'AvScanner | undefined'.
  Type 'Mock<[]>' is not assignable to type 'AvScanner'.
    Types of parameters 'args' and 'filePath' are incompatible.
      Type '[filePath: string]' is not assignable to type 'never'.

42     await runAttachmentScan("att-2", avFixtures.infected, scanner);
                                                             ~~~~~~~

src/lib/notification.ts:232:11 - error TS2322: Type 'JsonValue' is not assignable to type 'string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown; } | DbNull | JsonNull | { readonly [x: string]: Exact<InputJsonValue | null | undefined, InputJsonValue | ... 1 more ... | undefined>; } | ... 4 more ... | undefined'.
  Type 'null' is not assignable to type 'string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown; } | DbNull | JsonNull | { readonly [x: string]: Exact<InputJsonValue | null | undefined, InputJsonValue | ... 1 more ... | undefined>; } | ... 4 more ... | undefined'.

232           data: notificationData,
              ~~~~

  node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d.ts:29712:5
    29712     data?: NullableJsonNullValueInput | InputJsonValue
              ~~~~
    The expected type comes from property 'data' which is declared here on type 'Exact<(Without<InAppNotificationCreateInput, InAppNotificationUncheckedCreateInput> & InAppNotificationUncheckedCreateInput) | (Without<...> & InAppNotificationCreateInput), (Without<...> & InAppNotificationUncheckedCreateInput) | (Without<...> & InAppNotificationCreateInput)>'

src/lib/ticket-list.ts:195:5 - error TS2322: Type '{ assigneeTeamId?: string | undefined; assigneeUserId?: string | undefined; resolvedAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; updatedAt?: { ...; } | undefined; ... 8 more ...; organizationId?: undefined; } | { ...; } | { ...; }' is not assignable to type 'Exact<TicketWhereInput | undefined, TicketWhereInput | undefined>'.
  Type '{ assigneeTeamId?: string | undefined; assigneeUserId?: string | undefined; resolvedAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; updatedAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; ... 8 more ...; organizationId?: undefined; }' is not assignable to type 'Exact<TicketWhereInput | undefined, TicketWhereInput | undefined>'.
    Type '{ assigneeTeamId?: string | undefined; assigneeUserId?: string | undefined; resolvedAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; updatedAt?: { lte?: Date | undefined; gte?: Date | undefined; } | undefined; ... 8 more ...; organizationId?: undefined; }' is not assignable to type '{ AND?: Exact<TicketWhereInput | TicketWhereInput[] | undefined, TicketWhereInput | TicketWhereInput[] | undefined>; ... 33 more ...; csatResponse?: Exact<...>; }'.
      Types of property 'id' are incompatible.
        Type 'null' is not assignable to type 'Exact<string | StringFilter<"Ticket"> | undefined, string | StringFilter<"Ticket"> | undefined>'.

195     where,
        ~~~~~

src/lib/ticket-list.ts:216:12 - error TS2322: Type '{ number: number; category: string | null; id: string; organizationId: string; createdAt: Date; updatedAt: Date; status: TicketStatus; requesterId: string; resolvedAt: Date | null; ... 12 more ...; lastReopenedAt: Date | null; }[]' is not assignable to type '({ requester: { id: string; name: string; email: string; passwordHash: string; emailVerified: Date | null; role: Role; organizationId: string; createdAt: Date; updatedAt: Date; }; assigneeUser: { ...; } | null; assigneeTeam: { ...; } | null; } & { ...; })[]'.
  Type '{ number: number; category: string | null; id: string; organizationId: string; createdAt: Date; updatedAt: Date; status: TicketStatus; requesterId: string; resolvedAt: Date | null; ... 12 more ...; lastReopenedAt: Date | null; }' is not assignable to type '{ requester: { id: string; name: string; email: string; passwordHash: string; emailVerified: Date | null; role: Role; organizationId: string; createdAt: Date; updatedAt: Date; }; assigneeUser: { ...; } | null; assigneeTeam: { ...; } | null; } & { ...; }'.
    Type '{ number: number; category: string | null; id: string; organizationId: string; createdAt: Date; updatedAt: Date; status: TicketStatus; requesterId: string; resolvedAt: Date | null; ... 12 more ...; lastReopenedAt: Date | null; }' is missing the following properties from type '{ requester: { id: string; name: string; email: string; passwordHash: string; emailVerified: Date | null; role: Role; organizationId: string; createdAt: Date; updatedAt: Date; }; assigneeUser: { ...; } | null; assigneeTeam: { ...; } | null; }': requester, assigneeUser, assigneeTeam

216   return { tickets: items, nextCursor, prevCursor };
               ~~~~~~~

  src/lib/ticket-list.ts:41:3
    41   tickets: Awaited<ReturnType<typeof prisma.ticket.findMany<{ include: { requester: true; assigneeUser: true; assigneeTeam: true } }>>>;
         ~~~~~~~
    The expected type comes from property 'tickets' which is declared here on type 'TicketListResult'

tests/admin-automation-rules-integration.test.ts:243:48 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

243       const res = await PATCH(req, { params: { id: "rule-1" } });
                                                   ~~

  src/app/api/admin/automation-rules/[id]/route.ts:45:17
    45   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/admin-automation-rules-integration.test.ts:285:48 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

285       const res = await PATCH(req, { params: { id: "rule-1" } });
                                                   ~~

  src/app/api/admin/automation-rules/[id]/route.ts:45:17
    45   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/admin-automation-rules-integration.test.ts:298:48 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

298       const res = await PATCH(req, { params: { id: "rule-other" } });
                                                   ~~

  src/app/api/admin/automation-rules/[id]/route.ts:45:17
    45   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/admin-automation-rules-integration.test.ts:322:49 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

322       const res = await DELETE(req, { params: { id: "rule-1" } });
                                                    ~~

  src/app/api/admin/automation-rules/[id]/route.ts:127:17
    127   { params }: { params: Promise<{ id: string }> }
                        ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/admin-automation-rules-integration.test.ts:346:49 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

346       const res = await DELETE(req, { params: { id: "rule-other" } });
                                                    ~~

  src/app/api/admin/automation-rules/[id]/route.ts:127:17
    127   { params }: { params: Promise<{ id: string }> }
                        ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/admin-teams-integration.test.ts:149:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

149       const res = await POST(req);
                                 ~~~

tests/admin-teams-integration.test.ts:185:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

185       const res = await POST(req);
                                 ~~~

tests/admin-teams-integration.test.ts:205:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

205       const res = await POST(req);
                                 ~~~

tests/admin-teams-integration.test.ts:218:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

218       const res = await POST(req);
                                 ~~~

tests/admin-teams-integration.test.ts:256:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

256       const res = await PATCH(req, { params: Promise.resolve({ id: "team-1" }) });
                                  ~~~

tests/admin-teams-integration.test.ts:288:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

288       const res = await PATCH(req, { params: Promise.resolve({ id: "team-other" }) });
                                  ~~~

tests/admin-teams-integration.test.ts:310:32 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

310       const res = await DELETE(req, { params: Promise.resolve({ id: "team-1" }) });
                                   ~~~

tests/admin-teams-integration.test.ts:341:32 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

341       const res = await DELETE(req, { params: Promise.resolve({ id: "team-1" }) });
                                   ~~~

tests/admin-teams-integration.test.ts:360:32 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

360       const res = await DELETE(req, { params: Promise.resolve({ id: "team-other" }) });
                                   ~~~

tests/admin-users-integration.test.ts:102:25 - error TS2554: Expected 1 arguments, but got 0.

102       const res = await GET();
                            ~~~

  src/app/api/admin/users/route.ts:11:27
    11 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/admin-users-integration.test.ts:132:25 - error TS2554: Expected 1 arguments, but got 0.

132       const res = await GET();
                            ~~~

  src/app/api/admin/users/route.ts:11:27
    11 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/admin-users-integration.test.ts:143:25 - error TS2554: Expected 1 arguments, but got 0.

143       const res = await GET();
                            ~~~

  src/app/api/admin/users/route.ts:11:27
    11 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/admin-users-integration.test.ts:176:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

176       const res = await POST(req);
                                 ~~~

tests/admin-users-integration.test.ts:215:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

215       const res = await POST(req);
                                 ~~~

tests/admin-users-integration.test.ts:238:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

238       const res = await POST(req);
                                 ~~~

tests/admin-users-integration.test.ts:254:30 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

254       const res = await POST(req);
                                 ~~~

tests/admin-users-integration.test.ts:297:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

297       const res = await PATCH(req, { params: Promise.resolve({ id: "user-1" }) });
                                  ~~~

tests/admin-users-integration.test.ts:329:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

329       const res = await PATCH(req, { params: Promise.resolve({ id: "user-other" }) });
                                  ~~~

tests/admin-users-integration.test.ts:353:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

353       const res = await PATCH(req, { params: Promise.resolve({ id: "user-1" }) });
                                  ~~~

tests/admin-users-integration.test.ts:377:32 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

377       const res = await DELETE(req, { params: Promise.resolve({ id: "user-1" }) });
                                   ~~~

tests/admin-users-integration.test.ts:410:32 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

410       const res = await DELETE(req, { params: Promise.resolve({ id: "user-1" }) });
                                   ~~~

tests/admin-users-integration.test.ts:429:32 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

429       const res = await DELETE(req, { params: Promise.resolve({ id: "user-other" }) });
                                   ~~~

tests/attachment-download.test.ts:72:44 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; attachmentId: string; }>'.

72     const res = await GET(req, { params: { id: "t1", attachmentId: "att-1" } });
                                              ~~

  src/app/api/tickets/[id]/attachments/[attachmentId]/route.ts:9:17
    9   { params }: { params: Promise<{ id: string; attachmentId: string }> }
                      ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; attachmentId: string; }>; }'

tests/authorization-security.test.ts:30:21 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

30       expect(result.response?.status).toBe(401);
                       ~~~~~~~~

tests/authorization-security.test.ts:39:21 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

39       expect(result.response?.status).toBe(401);
                       ~~~~~~~~

tests/authorization-security.test.ts:54:21 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

54       expect(result.response?.status).toBe(401);
                       ~~~~~~~~

tests/authorization-security.test.ts:69:21 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

69       expect(result.response?.status).toBe(401);
                       ~~~~~~~~

tests/authorization-security.test.ts:84:21 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

84       expect(result.response?.status).toBe(401);
                       ~~~~~~~~

tests/authorization-security.test.ts:99:21 - error TS2339: Property 'response' does not exist on type 'AuthResult'.
  Property 'response' does not exist on type '{ ok: true; user: AuthenticatedUser; }'.

99       expect(result.response?.status).toBe(401);
                       ~~~~~~~~

tests/authorization-security.test.ts:114:21 - error TS2339: Property 'user' does not exist on type 'AuthResult'.
  Property 'user' does not exist on type '{ ok: false; response: NextResponse<unknown>; }'.

114       expect(result.user).toEqual({
                        ~~~~

tests/authorization-security.test.ts:133:21 - error TS2339: Property 'user' does not exist on type 'AuthResult'.
  Property 'user' does not exist on type '{ ok: false; response: NextResponse<unknown>; }'.

133       expect(result.user).toEqual({
                        ~~~~

tests/authorization-security.test.ts:152:21 - error TS2339: Property 'user' does not exist on type 'AuthResult'.
  Property 'user' does not exist on type '{ ok: false; response: NextResponse<unknown>; }'.

152       expect(result.user).toEqual({
                        ~~~~

tests/comment-spam-guard.test.ts:73:65 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

73     const res1 = await createComment(makeRequest(), { params: { id: "t1" } });
                                                                   ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/comment-spam-guard.test.ts:74:65 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

74     const res2 = await createComment(makeRequest(), { params: { id: "t1" } });
                                                                   ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/contract/api-contract.test.ts:318:54 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

318     const res = await createComment(req, { params: { id: "missing" } });
                                                         ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/contract/api-contract.test.ts:353:54 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

353     const res = await createComment(req, { params: { id: "t1" } });
                                                         ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/contract/api-contract.test.ts:389:54 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

389     const res = await createComment(req, { params: { id: "t1" } });
                                                         ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/contract/api-contract.test.ts:402:23 - error TS2554: Expected 1 arguments, but got 0.

402     const res = await listUsers();
                          ~~~~~~~~~

  src/app/api/admin/users/route.ts:11:27
    11 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/contract/api-contract.test.ts:416:23 - error TS2554: Expected 1 arguments, but got 0.

416     const res = await listUsers();
                          ~~~~~~~~~

  src/app/api/admin/users/route.ts:11:27
    11 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/contract/api-contract.test.ts:446:23 - error TS2554: Expected 1 arguments, but got 0.

446     const res = await listUsers();
                          ~~~~~~~~~

  src/app/api/admin/users/route.ts:11:27
    11 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/contract/api-contract.test.ts:477:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

477     const res = await createUser(req);
                                     ~~~

tests/contract/api-contract.test.ts:496:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

496     const res = await createUser(req);
                                     ~~~

tests/contract/api-contract.test.ts:521:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

521     const res = await createUser(req);
                                     ~~~

tests/contract/api-contract.test.ts:551:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

551     const res = await createUser(req);
                                     ~~~

tests/contract/api-contract.test.ts:588:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

588     const res = await createUser(req);
                                     ~~~

tests/contract/api-contract.test.ts:606:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

606     const res = await getUser({} as unknown as Request, { params: { id: "user-1" } });
                                  ~~~~~~~~~~~~~~~~~~~~~~~~

tests/contract/api-contract.test.ts:622:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

622     const res = await getUser({} as unknown as Request, { params: { id: "nonexistent" } });
                                  ~~~~~~~~~~~~~~~~~~~~~~~~

tests/contract/api-contract.test.ts:651:31 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

651     const res = await getUser({} as unknown as Request, { params: { id: "user-1" } });
                                  ~~~~~~~~~~~~~~~~~~~~~~~~

tests/contract/api-contract.test.ts:674:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

674     const res = await updateUser(req, { params: { id: "user-1" } });
                                     ~~~

tests/contract/api-contract.test.ts:695:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

695     const res = await updateUser(req, { params: { id: "nonexistent" } });
                                     ~~~

tests/contract/api-contract.test.ts:734:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

734     const res = await updateUser(req, { params: { id: "user-1" } });
                                     ~~~

tests/contract/api-contract.test.ts:755:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

755     const res = await deleteUser(req, { params: { id: "user-1" } });
                                     ~~~

tests/contract/api-contract.test.ts:779:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

779     const res = await deleteUser(req, { params: { id: "admin-1" } });
                                     ~~~

tests/contract/api-contract.test.ts:804:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

804     const res = await deleteUser(req, { params: { id: "user-1" } });
                                     ~~~

tests/contract/api-contract.test.ts:830:34 - error TS2345: Argument of type 'Request' is not assignable to parameter of type 'NextRequest'.
  Type 'Request' is missing the following properties from type 'NextRequest': cookies, nextUrl, page, ua

830     const res = await deleteUser(req, { params: { id: "user-1" } });
                                     ~~~

tests/csat-trigger.test.ts:41:3 - error TS2322: Type 'Mock<() => Promise<{ id: string; status: string; deduped: boolean; }>>' is not assignable to type '(request: NotificationRequest) => Promise<NotificationResult>'.
  Type 'Promise<{ id: string; status: string; deduped: boolean; }>' is not assignable to type 'Promise<NotificationResult>'.
    Type '{ id: string; status: string; deduped: boolean; }' is not assignable to type 'NotificationResult'.
      Types of property 'status' are incompatible.
        Type 'string' is not assignable to type '"queued" | "sent"'.

41   send: vi.fn(async () => ({ id: "notif-1", status: "queued", deduped: false })),
     ~~~~

  src/lib/notification.ts:34:3
    34   send(request: NotificationRequest): Promise<NotificationResult>;
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    The expected type comes from property 'send' which is declared here on type 'NotificationService'

tests/csat-trigger.test.ts:110:46 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

110     const res = await PATCH(req, { params: { id: ticketId } });
                                                 ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/csat-trigger.test.ts:175:46 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

175     const res = await PATCH(req, { params: { id: ticketId } });
                                                 ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/csat-trigger.test.ts:233:46 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

233     const res = await PATCH(req, { params: { id: ticketId } });
                                                 ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/csat-trigger.test.ts:283:46 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

283     const res = await PATCH(req, { params: { id: ticketId } });
                                                 ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/dashboard-sla-widgets.test.ts:21:11 - error TS2367: This comparison appears to be unintentional because the types '"W_TOKU" | "ROZWIAZANE" | "NOWE"' and '"ZAMKNIETE"' have no overlap.

21       if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

tests/dashboard-sla-widgets.test.ts:29:11 - error TS2367: This comparison appears to be unintentional because the types '"W_TOKU" | "ROZWIAZANE" | "NOWE"' and '"ZAMKNIETE"' have no overlap.

29       if (ticket.status === "ZAMKNIETE" || ticket.status === "ROZWIAZANE") {
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

tests/dashboard-sla-widgets.test.ts:37:79 - error TS2367: This comparison appears to be unintentional because the types '"W_TOKU" | "NOWE"' and '"ZAMKNIETE"' have no overlap.

37     expect(filteredBreached.every(ticket => ticket.status !== "ROZWIAZANE" && ticket.status !== "ZAMKNIETE")).toBe(true);
                                                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

tests/dashboard-sla-widgets.test.ts:38:78 - error TS2367: This comparison appears to be unintentional because the types '"W_TOKU" | "NOWE"' and '"ZAMKNIETE"' have no overlap.

38     expect(filteredHealthy.every(ticket => ticket.status !== "ROZWIAZANE" && ticket.status !== "ZAMKNIETE")).toBe(true);
                                                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

tests/email-adapter.test.ts:9:39 - error TS2554: Expected 0 arguments, but got 1.

  9     const result = await adapter.send({
                                          ~
 10       to: "user@example.com",
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
 12       body: "Hello",
    ~~~~~~~~~~~~~~~~~~~~
 13     });
    ~~~~~

tests/email-adapter.test.ts:21:39 - error TS2554: Expected 0 arguments, but got 1.

 21     const result = await adapter.send({
                                          ~
 22       to: "user@example.com",
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
 25       data: { name: "John" },
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 26     });
    ~~~~~

tests/notification-channels.test.ts:76:23 - error TS2554: Expected 1 arguments, but got 0.

76     const res = await GET();
                         ~~~

  src/app/api/notifications/route.ts:47:27
    47 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/notification-channels.test.ts:108:23 - error TS2554: Expected 1 arguments, but got 0.

108     const res = await GET();
                          ~~~

  src/app/api/notifications/route.ts:47:27
    47 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/notification-channels.test.ts:124:23 - error TS2554: Expected 1 arguments, but got 0.

124     const res = await GET();
                          ~~~

  src/app/api/notifications/route.ts:47:27
    47 export async function GET(req: Request) {
                                 ~~~~~~~~~~~~
    An argument for 'req' was not provided.

tests/notification-delivery-integration.test.ts:6:15 - error TS2459: Module '"@/lib/notification"' declares 'EmailAdapter' locally, but it is not exported.

6 import type { EmailAdapter } from "@/lib/notification";
                ~~~~~~~~~~~~

  src/lib/notification.ts:6:47
    6 import { emailAdapter as defaultEmailAdapter, EmailAdapter } from "@/lib/email-adapter";
                                                    ~~~~~~~~~~~~
    'EmailAdapter' is declared here.

tests/notification-delivery-integration.test.ts:91:41 - error TS2345: Argument of type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

91       const result = await handleSlaJob(payload, {
                                           ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification-delivery-integration.test.ts:122:26 - error TS2345: Argument of type '{ jobType: "resolve"; ticketId: string; organizationId: string; dueAt: string; priority: "WYSOKI"; jobId: string; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "resolve"; ticketId: string; organizationId: string; dueAt: string; priority: "WYSOKI"; jobId: string; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

122       await handleSlaJob(payload, {
                             ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification-delivery-integration.test.ts:149:42 - error TS2345: Argument of type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

149       const result1 = await handleSlaJob(payload, {
                                             ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification-delivery-integration.test.ts:156:42 - error TS2345: Argument of type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

156       const result2 = await handleSlaJob(payload, {
                                             ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification-delivery-integration.test.ts:186:46 - error TS2345: Argument of type '{ jobType: "reminder"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; metadata: { reminderFor: string; requesterId: string; }; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "reminder"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; metadata: { reminderFor: string; requesterId: string; }; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

186       const result = await handleSlaReminder(payload, { notifier: notificationService });
                                                 ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification-delivery-integration.test.ts:217:31 - error TS2345: Argument of type '{ jobType: "reminder"; ticketId: string; organizationId: string; dueAt: string; priority: "WYSOKI"; jobId: string; metadata: { reminderFor: string; requesterId: string; }; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "reminder"; ticketId: string; organizationId: string; dueAt: string; priority: "WYSOKI"; jobId: string; metadata: { reminderFor: string; requesterId: string; }; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

217       await handleSlaReminder(payload, { notifier: notificationService });
                                  ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification-delivery-integration.test.ts:254:41 - error TS2345: Argument of type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

254       const result = await handleSlaJob(payload, {
                                            ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification-delivery-integration.test.ts:285:22 - error TS2345: Argument of type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' is not assignable to parameter of type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.
  Property 'categoryId' is missing in type '{ jobType: "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: "SREDNI"; jobId: string; }' but required in type '{ jobId: string; jobType: "resolve" | "reminder" | "first-response"; ticketId: string; organizationId: string; dueAt: string; priority: string; categoryId: string | null; metadata?: Record<string, unknown> | undefined; idempotencyKey?: string | undefined; }'.

285         handleSlaJob(payload, {
                         ~~~~~~~

  src/lib/sla-jobs.ts:15:3
    15   categoryId: z.string().uuid().nullable(),
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'categoryId' is declared here.

tests/notification.test.ts:118:5 - error TS2578: Unused '@ts-expect-error' directive.

118     // @ts-expect-error testing validation
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

tests/rate-limit.test.ts:84:65 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

84     const res1 = await createComment(makeRequest(), { params: { id: "t1" } });
                                                                   ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/rate-limit.test.ts:85:65 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

85     const res2 = await createComment(makeRequest(), { params: { id: "t1" } });
                                                                   ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/rate-limit.test.ts:86:65 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

86     const res3 = await createComment(makeRequest(), { params: { id: "t1" } });
                                                                   ~~

  src/app/api/tickets/[id]/comments/route.ts:21:17
    21   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:126:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

126         lastReopenedAt: recentReopen,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:139:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

139     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:153:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

153         lastReopenedAt: oldReopen,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:159:9 - error TS2322: Type '"PONOWNIE_OTWARTE"' is not assignable to type '"ZAMKNIETE"'.

159         status: TicketStatus.PONOWNIE_OTWARTE,
            ~~~~~~

tests/reopen-throttling.test.ts:160:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

160         lastReopenedAt: now,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:162:9 - error TS2322: Type 'null' is not assignable to type 'Date | undefined'.

162         closedAt: null,
            ~~~~~~~~

tests/reopen-throttling.test.ts:188:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

188     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:206:9 - error TS2322: Type '"PONOWNIE_OTWARTE"' is not assignable to type '"ZAMKNIETE"'.

206         status: TicketStatus.PONOWNIE_OTWARTE,
            ~~~~~~

tests/reopen-throttling.test.ts:207:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

207         lastReopenedAt: now,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:209:9 - error TS2322: Type 'null' is not assignable to type 'Date | undefined'.

209         closedAt: null,
            ~~~~~~~~

tests/reopen-throttling.test.ts:235:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

235     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:248:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

248         lastReopenedAt: recentReopen,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:254:9 - error TS2322: Type '"PONOWNIE_OTWARTE"' is not assignable to type '"ZAMKNIETE"'.

254         status: TicketStatus.PONOWNIE_OTWARTE,
            ~~~~~~

tests/reopen-throttling.test.ts:255:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

255         lastReopenedAt: now,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:257:9 - error TS2322: Type 'null' is not assignable to type 'Date | undefined'.

257         closedAt: null,
            ~~~~~~~~

tests/reopen-throttling.test.ts:283:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

283     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:290:9 - error TS2322: Type '"NOWE"' is not assignable to type '"ZAMKNIETE"'.

290         status: TicketStatus.NOWE,
            ~~~~~~

tests/reopen-throttling.test.ts:291:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

291         lastReopenedAt: new Date(Date.now() - 500),
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:324:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

324     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:331:9 - error TS2322: Type '"PONOWNIE_OTWARTE"' is not assignable to type '"ZAMKNIETE"'.

331         status: TicketStatus.PONOWNIE_OTWARTE,
            ~~~~~~

tests/reopen-throttling.test.ts:332:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

332         lastReopenedAt: new Date(Date.now() - 500),
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:339:9 - error TS2322: Type '"PONOWNIE_OTWARTE"' is not assignable to type '"ZAMKNIETE"'.

339         status: TicketStatus.PONOWNIE_OTWARTE,
            ~~~~~~

tests/reopen-throttling.test.ts:364:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

364     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:387:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

387     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:410:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

410     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:427:9 - error TS2322: Type '"PONOWNIE_OTWARTE"' is not assignable to type '"ZAMKNIETE"'.

427         status: TicketStatus.PONOWNIE_OTWARTE,
            ~~~~~~

tests/reopen-throttling.test.ts:428:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

428         lastReopenedAt: now,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:430:9 - error TS2322: Type 'null' is not assignable to type 'Date | undefined'.

430         closedAt: null,
            ~~~~~~~~

tests/reopen-throttling.test.ts:456:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

456     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:471:9 - error TS2322: Type '"PONOWNIE_OTWARTE"' is not assignable to type '"ZAMKNIETE"'.

471         status: TicketStatus.PONOWNIE_OTWARTE,
            ~~~~~~

tests/reopen-throttling.test.ts:472:9 - error TS2322: Type 'Date' is not assignable to type 'null | undefined'.

472         lastReopenedAt: now,
            ~~~~~~~~~~~~~~

tests/reopen-throttling.test.ts:474:9 - error TS2322: Type 'null' is not assignable to type 'Date | undefined'.

474         closedAt: null,
            ~~~~~~~~

tests/reopen-throttling.test.ts:504:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

504     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/reopen-throttling.test.ts:514:9 - error TS2322: Type '"NOWE"' is not assignable to type '"ZAMKNIETE"'.

514         status: TicketStatus.NOWE,
            ~~~~~~

tests/reopen-throttling.test.ts:549:53 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

549     const res = await updateTicket(req, { params: { id: "t1" } });
                                                        ~~

  src/app/api/tickets/[id]/route.ts:352:14
    352   context: { params: Promise<{ id: string }> }
                     ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/sla-escalation.test.ts:41:33 - error TS2339: Property 'mockResolvedValueOnce' does not exist on type '<A extends SlaEscalationLevelFindManyArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args?: Exact<A, SlaEscalationLevelFindManyArgs<InternalArgs & { ...; }>> | undefined) => PrismaPromise<...>'.

41     slaEscalationLevel.findMany.mockResolvedValueOnce([]);
                                   ~~~~~~~~~~~~~~~~~~~~~

tests/sla-escalation.test.ts:42:33 - error TS2339: Property 'mockResolvedValueOnce' does not exist on type '<A extends SlaEscalationLevelFindManyArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args?: Exact<A, SlaEscalationLevelFindManyArgs<InternalArgs & { ...; }>> | undefined) => PrismaPromise<...>'.

42     slaEscalationLevel.findMany.mockResolvedValueOnce([
                                   ~~~~~~~~~~~~~~~~~~~~~

tests/sla-escalation.test.ts:56:33 - error TS2339: Property 'mockResolvedValue' does not exist on type '<A extends SlaEscalationLevelFindManyArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args?: Exact<A, SlaEscalationLevelFindManyArgs<InternalArgs & { ...; }>> | undefined) => PrismaPromise<...>'.

56     slaEscalationLevel.findMany.mockResolvedValue([]);
                                   ~~~~~~~~~~~~~~~~~

tests/sla-policies.route.test.ts:137:10 - error TS18047: 'res.body' is possibly 'null'.

137   expect(res.body.policies).toHaveLength(1);
             ~~~~~~~~

tests/sla-policies.route.test.ts:137:19 - error TS2339: Property 'policies' does not exist on type 'ReadableStream<Uint8Array<ArrayBuffer>>'.

137   expect(res.body.policies).toHaveLength(1);
                      ~~~~~~~~

tests/sla-policies.route.test.ts:153:46 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

153     const res = await PATCH(req, { params: { id: "policy-2" } });
                                                 ~~

  src/app/api/admin/sla-policies/[id]/route.ts:55:17
    55   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/sla-policies.route.test.ts:184:46 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

184     const res = await PATCH(req, { params: { id: "policy-4" } });
                                                 ~~

  src/app/api/admin/sla-policies/[id]/route.ts:55:17
    55   { params }: { params: Promise<{ id: string }> }
                       ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/sla-policies.route.test.ts:186:12 - error TS18047: 'res.body' is possibly 'null'.

186     expect(res.body.policy).toEqual(updated);
               ~~~~~~~~

tests/sla-policies.route.test.ts:186:21 - error TS2339: Property 'policy' does not exist on type 'ReadableStream<Uint8Array<ArrayBuffer>>'.

186     expect(res.body.policy).toEqual(updated);
                        ~~~~~~

tests/sla-policies.route.test.ts:216:73 - error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Promise<{ id: string; }>'.

216   const res = await DELETE(new Request("http://localhost"), { params: { id: "policy-3" } });
                                                                            ~~

  src/app/api/admin/sla-policies/[id]/route.ts:181:17
    181   { params }: { params: Promise<{ id: string }> }
                        ~~~~~~
    The expected type comes from property 'params' which is declared here on type '{ params: Promise<{ id: string; }>; }'

tests/sla-reminder.test.ts:22:55 - error TS2322: Type '{ send: Mock<() => Promise<{ id: string; status: string; deduped: boolean; }>>; }' is not assignable to type 'NotificationService'.
  The types returned by 'send(...)' are incompatible between these types.
    Type 'Promise<{ id: string; status: string; deduped: boolean; }>' is not assignable to type 'Promise<NotificationResult>'.
      Type '{ id: string; status: string; deduped: boolean; }' is not assignable to type 'NotificationResult'.
        Types of property 'status' are incompatible.
          Type 'string' is not assignable to type '"sent" | "queued"'.

22     const result = await handleSlaReminder(payload, { notifier });
                                                         ~~~~~~~~

tests/sla-scheduler.test.ts:46:5 - error TS2304: Cannot find name 'afterEach'.

46     afterEach(() => {
       ~~~~~~~~~

tests/sla-worker.test.ts:35:3 - error TS2304: Cannot find name 'beforeEach'.

35   beforeEach(() => {
     ~~~~~~~~~~

tests/sla-worker.test.ts:42:7 - error TS2322: Type 'Mock<() => Promise<{ id: string; status: string; deduped: boolean; }>>' is not assignable to type '(request: NotificationRequest) => Promise<NotificationResult>'.
  Type 'Promise<{ id: string; status: string; deduped: boolean; }>' is not assignable to type 'Promise<NotificationResult>'.
    Type '{ id: string; status: string; deduped: boolean; }' is not assignable to type 'NotificationResult'.
      Types of property 'status' are incompatible.
        Type 'string' is not assignable to type '"sent" | "queued"'.

42       send: vi.fn(async () => ({ id: "notif-1", status: "queued", deduped: false })),
         ~~~~

  src/lib/notification.ts:34:3
    34   send(request: NotificationRequest): Promise<NotificationResult>;
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    The expected type comes from property 'send' which is declared here on type 'NotificationService'

tests/sla-worker.test.ts:53:60 - error TS2322: Type '{ ticket: { findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }; auditEvent: { ...; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

53     const result = await handleSlaJob(payload, { notifier, client: prismaMock, now: new Date() });
                                                              ~~~~~~

tests/sla-worker.test.ts:68:7 - error TS2322: Type 'Date' is not assignable to type 'null'.

68       firstResponseAt: new Date(),
         ~~~~~~~~~~~~~~~

  tests/sla-worker.test.ts:15:3
    15   firstResponseAt: null,
         ~~~~~~~~~~~~~~~~~~~~~
    The expected type comes from property 'firstResponseAt' which is declared here on type '{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; resolveDue: Date; ... 4 more ...; slaPauseTotalSeconds: number; }'

tests/sla-worker.test.ts:81:60 - error TS2322: Type '{ ticket: { findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }; auditEvent: { ...; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

81     const result = await handleSlaJob(payload, { notifier, client: prismaMock, now: new Date() });
                                                              ~~~~~~

tests/sla-worker.test.ts:94:56 - error TS2345: Argument of type '{ status: "OCZEKUJE_NA_UZYTKOWNIKA"; slaPausedAt: Date; id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; firstResponseAt: null; firstResponseDue: Date; ... 4 more ...; slaPauseTotalSeconds: number; }' is not assignable to parameter of type '{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; resolveDue: Date; ... 4 more ...; slaPauseTotalSeconds: number; }'.
  Types of property 'status' are incompatible.
    Type '"OCZEKUJE_NA_UZYTKOWNIKA"' is not assignable to type '"W_TOKU"'.

94     prismaMock.ticket.findUnique.mockResolvedValueOnce(waitingTicket);
                                                          ~~~~~~~~~~~~~

tests/sla-worker.test.ts:107:60 - error TS2322: Type '{ ticket: { findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }; auditEvent: { ...; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<() => Promise<{ id: string; number: number; requesterId: string; assigneeUserId: string; organizationId: string; status: "W_TOKU"; firstResponseAt: null; firstResponseDue: Date; ... 5 more ...; slaPauseTotalSeconds: number; }>>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

107     const result = await handleSlaJob(payload, { notifier, client: prismaMock, now: new Date() });
                                                               ~~~~~~

tests/ticket-form-sla-preview.test.tsx:15:1 - error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

15 describe("TicketForm SLA preview", () => {
   ~~~~~~~~

tests/ticket-form-sla-preview.test.tsx:18:3 - error TS2304: Cannot find name 'beforeEach'.

18   beforeEach(() => {
     ~~~~~~~~~~

tests/ticket-form-sla-preview.test.tsx:57:3 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

57   it("renders SLA preview matching returned policy", async () => {
     ~~

tests/ticket-form-sla-preview.test.tsx:61:7 - error TS2304: Cannot find name 'expect'.

61       expect(fetchMock).toHaveBeenCalledWith(
         ~~~~~~

tests/ticket-form-sla-preview.test.tsx:62:9 - error TS2304: Cannot find name 'expect'.

62         expect.stringContaining("/api/sla/preview"),
           ~~~~~~

tests/ticket-form-sla-preview.test.tsx:63:9 - error TS2304: Cannot find name 'expect'.

63         expect.objectContaining({ method: "POST" }),
           ~~~~~~

tests/ticket-form-sla-preview.test.tsx:67:5 - error TS2304: Cannot find name 'expect'.

67     expect(await screen.findByText(/Podgląd SLA/i)).toBeInTheDocument();
       ~~~~~~

tests/ticket-form-sla-preview.test.tsx:68:5 - error TS2304: Cannot find name 'expect'.

68     expect(screen.getByText(/~12h/)).toBeInTheDocument();
       ~~~~~~

tests/ticket-form-sla-preview.test.tsx:69:5 - error TS2304: Cannot find name 'expect'.

69     expect(screen.getByText(/~24h/)).toBeInTheDocument();
       ~~~~~~

tests/ticket-form-sla-preview.test.tsx:72:3 - error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

72   it("requests preview again when priority changes", async () => {
     ~~

tests/ticket-form-sla-preview.test.tsx:82:7 - error TS2304: Cannot find name 'expect'.

82       expect(calls.length).toBeGreaterThanOrEqual(2);
         ~~~~~~

tests/worker-job-processing-integration.test.ts:53:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

53         client: mockPrisma,
           ~~~~~~

tests/worker-job-processing-integration.test.ts:91:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

91         client: mockPrisma,
           ~~~~~~

tests/worker-job-processing-integration.test.ts:122:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

122         client: mockPrisma,
            ~~~~~~

tests/worker-job-processing-integration.test.ts:148:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

148         client: mockPrisma,
            ~~~~~~

tests/worker-job-processing-integration.test.ts:172:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

172         client: mockPrisma,
            ~~~~~~

tests/worker-job-processing-integration.test.ts:196:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

196         client: mockPrisma,
            ~~~~~~

tests/worker-job-processing-integration.test.ts:221:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

221         client: mockPrisma,
            ~~~~~~

tests/worker-job-processing-integration.test.ts:242:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

242         client: mockPrisma,
            ~~~~~~

tests/worker-job-processing-integration.test.ts:266:9 - error TS2322: Type '{ ticket: { findUnique: Mock<Procedure>; }; auditEvent: { create: Mock<Procedure>; }; }' is not assignable to type 'SlaClient'.
  Types of property 'ticket' are incompatible.
    Type '{ findUnique: Mock<Procedure>; }' is not assignable to type 'DynamicModelExtensionThis<TypeMap<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }, PrismaClientOptions>, "Ticket", { result: {}; model: {}; query: {}; client: {}; }, {}>'.
      Type '{ findUnique: Mock<Procedure>; }' is missing the following properties from type '{ findUnique: <A extends TicketFindUniqueArgs<InternalArgs & { result: {}; model: {}; query: {}; client: {}; }>>(args: Exact<A, TicketFindUniqueArgs<InternalArgs & { ...; }>>) => DynamicModelExtensionFluentApi<...> & PrismaPromise<...>; ... 14 more ...; count: <A extends TicketCountArgs<...>>(args?: Exact<...> | und...': findUniqueOrThrow, findFirst, findFirstOrThrow, findMany, and 11 more.

266         client: mockPrisma,
            ~~~~~~


Found 359 errors in 59 files.

Errors  Files
     1  e2e/admin-teams.spec.ts:37
     5  e2e/bulk-actions.spec.ts:26
     1  src/app/api/admin/automation-rules/[id]/route.ts:99
     2  src/app/api/admin/automation-rules/route.ts:66
    12  src/app/api/admin/teams/[id]/memberships/route.ts:12
    14  src/app/api/admin/teams/[id]/route.ts:12
     9  src/app/api/admin/teams/route.ts:8
    17  src/app/api/admin/users/[id]/route.ts:5
     6  src/app/api/admin/users/route.ts:37
     2  src/app/api/notifications/[id]/read/route.ts:11
     2  src/app/api/notifications/route.ts:48
     4  src/app/api/reports/csat/route.ts:14
    12  src/app/api/reports/export/comments/route.ts:18
     5  src/app/api/reports/export/tickets/route.ts:21
     4  src/app/api/reports/kpi/route.ts:7
    18  src/app/api/tickets/[id]/attachments/route.ts:23
     5  src/app/api/tickets/[id]/audit/route.ts:11
     1  src/app/api/tickets/[id]/csat/route.ts:67
     1  src/app/api/tickets/[id]/route.ts:66
     2  src/app/app/admin/audit/page.tsx:7
     6  src/app/app/admin/automation-rules/page.tsx:8
     4  src/app/app/admin/sla-policies/page.tsx:8
     4  src/app/app/admin/teams/page.tsx:8
     3  src/app/app/admin/users/page.tsx:8
     2  src/app/app/layout.tsx:7
     3  src/app/app/notifications/page.tsx:9
     3  src/app/app/page.tsx:231
     2  src/app/app/reports/page.tsx:98
     1  src/app/app/ticket-list.tsx:169
    15  src/app/app/tickets/[id]/audit-timeline.tsx:38
    14  src/app/app/tickets/[id]/page.tsx:49
     1  src/app/page.tsx:6
     4  src/lib/auth.ts:10
     4  src/lib/authorization.test.ts:27
     6  src/lib/av-scanner.test.ts:17
     1  src/lib/notification.ts:232
     2  src/lib/ticket-list.ts:195
     5  tests/admin-automation-rules-integration.test.ts:243
     9  tests/admin-teams-integration.test.ts:149
    13  tests/admin-users-integration.test.ts:102
     1  tests/attachment-download.test.ts:72
     9  tests/authorization-security.test.ts:30
     2  tests/comment-spam-guard.test.ts:73
    21  tests/contract/api-contract.test.ts:318
     5  tests/csat-trigger.test.ts:41
     4  tests/dashboard-sla-widgets.test.ts:21
     2  tests/email-adapter.test.ts:9
     3  tests/notification-channels.test.ts:76
     9  tests/notification-delivery-integration.test.ts:6
     1  tests/notification.test.ts:118
     3  tests/rate-limit.test.ts:84
    35  tests/reopen-throttling.test.ts:126
     3  tests/sla-escalation.test.ts:41
     7  tests/sla-policies.route.test.ts:137
     1  tests/sla-reminder.test.ts:22
     1  tests/sla-scheduler.test.ts:46
     7  tests/sla-worker.test.ts:35
    11  tests/ticket-form-sla-preview.test.tsx:15
     9  tests/worker-job-processing-integration.test.ts:53
     PS C:\Users\kacpe\Documents\GitHub\HelpDeskApp> pnpm lint

> serwisdesk@0.1.0 lint C:\Users\kacpe\Documents\GitHub\HelpDeskApp
> eslint "src/**/*.{ts,tsx}"

PS C:\Users\kacpe\Documents\GitHub\HelpDeskApp> pnpm build

> serwisdesk@0.1.0 build C:\Users\kacpe\Documents\GitHub\HelpDeskApp
> next build

 ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of C:\Users\kacpe\package-lock.json as the root directory.
 To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
   See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
 Detected additional lockfiles:
   * C:\Users\kacpe\Documents\GitHub\HelpDeskApp\pnpm-lock.yaml

   ▲ Next.js 16.0.10 (Turbopack)
   - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully in 8.3s
   Running TypeScript  ...Failed to compile.

./src/app/api/admin/automation-rules/[id]/route.ts:99:5
Type error: Type 'Partial<{ name: string; enabled: boolean; triggerConfig: unknown; actionConfig: unknown; }>' is not assignable to type 'Exact<(Without<AutomationRuleUpdateInput, AutomationRuleUncheckedUpdateInput> & AutomationRuleUncheckedUpdateInput) | (Without<...> & AutomationRuleUpdateInput), (Without<...> & AutomationRuleUncheckedUpdateInput) | (Without<...> & AutomationRuleUpdateInput)>'.
  Type 'Partial<{ name: string; enabled: boolean; triggerConfig: unknown; actionConfig: unknown; }>' is not assignable to type '{ organizationId?: undefined; id?: Exact<string | StringFieldUpdateOperationsInput | undefined, string | StringFieldUpdateOperationsInput | undefined>; ... 6 more ...; organization?: Exact<...>; }'.
    Types of property 'triggerConfig' are incompatible.
      Type 'unknown' is not assignable to type 'Exact<JsonNull | InputJsonValue | undefined, JsonNull | InputJsonValue | undefined>'.

   97 |   const rule = await prisma.automationRule.update({
   98 |     where: { id },
>  99 |     data: updateData,
      |     ^
  100 |   });
  101 |
  102 |   await recordAdminAudit({
Next.js build worker exited with code: 1 and signal: null
 ELIFECYCLE  Command failed with exit code 1.
PS C:\Users\kacpe\Documents\GitHub\HelpDeskApp> Get-ChildItem -Path . -Recurse -Filter *.backup -ErrorAction SilentlyContinue | Select-Object FullName

FullName
--------
C:\Users\kacpe\Documents\GitHub\HelpDeskApp\src\app\api\admin\users\route.ts.backup
C:\Users\kacpe\Documents\GitHub\HelpDeskApp\src\app\api\reports\analytics\route.ts.backup

