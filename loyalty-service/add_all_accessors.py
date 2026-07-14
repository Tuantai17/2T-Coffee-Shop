import os
import re

domain_dir = r"e:\Web2_\e-commerce-microservices\loyalty-service\src\main\java\com\rainbowforest\loyaltyservice\domain"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    class_match = re.search(r'public\s+class\s+(\w+)', content)
    if not class_match:
        return
    class_name = class_match.group(1)

    # find ALL private fields, handling possible assignments
    field_pattern = re.compile(r'^\s*(?:@[\w\(\)\"\s,=]+\n)*\s*private\s+([\w<>,\s]+)\s+(\w+)(?:\s*=[^;]+)?\s*;', re.MULTILINE)
    
    fields = []
    for match in field_pattern.finditer(content):
        field_type = match.group(1).strip()
        field_name = match.group(2).strip()
        fields.append((field_type, field_name))

    # Add getters/setters and builder
    methods = ""
    for ftype, fname in fields:
        # Add getter/setter if missing
        getter_name = 'get' + fname[0].upper() + fname[1:]
        setter_name = 'set' + fname[0].upper() + fname[1:]
        
        # very simple checks
        if f"public {ftype} {getter_name}()" not in content:
            methods += f"    public {ftype} {getter_name}() {{ return this.{fname}; }}\n"
        if f"public void {setter_name}(" not in content:
            methods += f"    public void {setter_name}({ftype} {fname}) {{ this.{fname} = {fname}; }}\n"

    # Now Builder
    builder_class = ""
    if f"public static {class_name}Builder builder()" not in content and f"public static class {class_name}Builder" not in content:
        builder_class = f"""
    public static class {class_name}Builder {{
"""
        for ftype, fname in fields:
            builder_class += f"        private {ftype} {fname};\n"
        
        for ftype, fname in fields:
            builder_class += f"""
        public {class_name}Builder {fname}({ftype} {fname}) {{
            this.{fname} = {fname};
            return this;
        }}
"""
        builder_class += f"""
        public {class_name} build() {{
            {class_name} obj = new {class_name}();
"""
        for ftype, fname in fields:
            setter_name = 'set' + fname[0].upper() + fname[1:]
            builder_class += f"            obj.{setter_name}(this.{fname});\n"
            
        builder_class += """            return obj;
        }
    }
    
"""
        builder_class += f"    public static {class_name}Builder builder() {{ return new {class_name}Builder(); }}\n"

    if not methods and not builder_class:
        return
        
    last_brace_index = content.rfind('}')
    if last_brace_index != -1:
        new_content = content[:last_brace_index] + methods + builder_class + content[last_brace_index:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Processed {filepath}")

for root, dirs, files in os.walk(domain_dir):
    for file in files:
        if file.endswith(".java"):
            process_file(os.path.join(root, file))

print("Done")
