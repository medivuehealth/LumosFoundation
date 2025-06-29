-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions table for many-to-many relationship
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

-- Create organization table
CREATE TABLE IF NOT EXISTS organizations (
    org_id SERIAL PRIMARY KEY,
    org_name TEXT NOT NULL,
    org_type TEXT NOT NULL CHECK (org_type IN ('hospital', 'clinic', 'private_practice', 'research_institution', 'pharmacy')),
    license_number TEXT,
    tax_id TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    phone_number TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_organizations table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_organizations (
    user_id TEXT NOT NULL,
    org_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    department TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, org_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Insert clinical roles
INSERT INTO roles (role_name, description) VALUES
    ('system_admin', 'System administrator with full access to all features'),
    ('org_admin', 'Organization administrator with full access within their organization'),
    ('physician', 'Licensed medical doctor with full patient care access'),
    ('nurse_practitioner', 'Advanced practice registered nurse'),
    ('registered_nurse', 'Registered nurse with patient care access'),
    ('pediatrician', 'Physician specializing in pediatric care'),
    ('gastroenterologist', 'Physician specializing in digestive system'),
    ('nutritionist', 'Specialist in nutrition and dietary management'),
    ('child_care_specialist', 'Specialist in pediatric care management'),
    ('medical_assistant', 'Clinical support staff'),
    ('research_scientist', 'Medical researcher with data access'),
    ('pharmacist', 'Licensed pharmacist'),
    ('therapist', 'Mental health professional'),
    ('social_worker', 'Healthcare social worker'),
    ('patient', 'Patient with access to their own records'),
    ('guardian', 'Legal guardian with access to dependent records')
ON CONFLICT (role_name) DO NOTHING;

-- Insert permissions
INSERT INTO permissions (permission_name, description) VALUES
    ('view_patient_records', 'Can view patient medical records'),
    ('edit_patient_records', 'Can edit patient medical records'),
    ('create_patient_records', 'Can create new patient records'),
    ('delete_patient_records', 'Can delete patient records'),
    ('view_analytics', 'Can view analytics and reports'),
    ('manage_users', 'Can manage user accounts'),
    ('manage_roles', 'Can manage roles and permissions'),
    ('prescribe_medications', 'Can prescribe medications'),
    ('order_tests', 'Can order medical tests'),
    ('view_test_results', 'Can view test results'),
    ('edit_test_results', 'Can edit and update test results'),
    ('manage_appointments', 'Can manage patient appointments'),
    ('access_billing', 'Can access billing information'),
    ('manage_organizations', 'Can manage organization settings'),
    ('view_audit_logs', 'Can view system audit logs'),
    ('export_data', 'Can export patient data'),
    ('manage_research_data', 'Can manage research data'),
    ('view_research_data', 'Can view research data')
ON CONFLICT (permission_name) DO NOTHING;

-- Assign permissions to roles
-- System Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'system_admin';

-- Organization Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'org_admin'
AND p.permission_name IN (
    'view_patient_records',
    'edit_patient_records',
    'create_patient_records',
    'view_analytics',
    'manage_users',
    'manage_roles',
    'manage_appointments',
    'access_billing',
    'manage_organizations',
    'view_audit_logs',
    'export_data'
);

-- Physician
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'physician'
AND p.permission_name IN (
    'view_patient_records',
    'edit_patient_records',
    'create_patient_records',
    'prescribe_medications',
    'order_tests',
    'view_test_results',
    'edit_test_results',
    'manage_appointments',
    'view_analytics',
    'export_data'
);

-- Nurse Practitioner
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'nurse_practitioner'
AND p.permission_name IN (
    'view_patient_records',
    'edit_patient_records',
    'create_patient_records',
    'prescribe_medications',
    'order_tests',
    'view_test_results',
    'edit_test_results',
    'manage_appointments'
);

-- Registered Nurse
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'registered_nurse'
AND p.permission_name IN (
    'view_patient_records',
    'edit_patient_records',
    'view_test_results',
    'manage_appointments'
);

-- Child Care Specialist
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'child_care_specialist'
AND p.permission_name IN (
    'view_patient_records',
    'edit_patient_records',
    'create_patient_records',
    'view_test_results',
    'manage_appointments'
);

-- Research Scientist
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'research_scientist'
AND p.permission_name IN (
    'view_research_data',
    'manage_research_data',
    'view_analytics',
    'export_data'
);

-- Create audit trigger for role changes
CREATE OR REPLACE FUNCTION audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        CURRENT_USER,
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.role_id::text
            ELSE NEW.role_id::text
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)
            ELSE NULL
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE row_to_json(NEW)
        END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON roles
FOR EACH ROW EXECUTE FUNCTION audit_role_changes();

CREATE TRIGGER role_permissions_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON role_permissions
FOR EACH ROW EXECUTE FUNCTION audit_role_changes(); 