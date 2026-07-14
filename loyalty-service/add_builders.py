import os
import re

domain_dir = r"e:\Web2_\e-commerce-microservices\loyalty-service\src\main\java\com\rainbowforest\loyaltyservice\domain"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Get class name
    class_match = re.search(r'public\s+class\s+(\w+)', content)
    if not class_match:
        return
    class_name = class_match.group(1)

    if f"public static {class_name}Builder builder()" in content:
        return # already added

    # Find all private fields
    field_pattern = re.compile(r'^\s*private\s+([\w<>,\s]+)\s+(\w+)\s*;', re.MULTILINE)
    fields = []
    for match in field_pattern.finditer(content):
        # some fields have initializers but usually domain classes don't or we don't care about them in builder signature
        field_type = match.group(1).strip()
        field_name = match.group(2).strip()
        fields.append((field_type, field_name))

    # Generate builder class string
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

    # Insert builder before the last closing brace
    last_brace_index = content.rfind('}')
    if last_brace_index != -1:
        new_content = content[:last_brace_index] + builder_class + content[last_brace_index:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Processed {filepath}")

for root, dirs, files in os.walk(domain_dir):
    for file in files:
        if file.endswith(".java"):
            process_file(os.path.join(root, file))

print("Done")
