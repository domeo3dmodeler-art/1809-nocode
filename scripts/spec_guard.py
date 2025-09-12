#!/usr/bin/env python3
import json, os, re, sys
SPEC_MD="master_spec.md"; OPENAPI="app/app/api/openapi.json"
def parse_expected_endpoints(text):
  eps=set()
  for line in text.splitlines():
    m=re.search(r'\b(GET|POST|PUT|PATCH|DELETE)\s+(/[\w\-/{}]+)',line,re.I)
    if m: eps.add((m.group(1).upper(), m.group(2)))
  return eps
def parse_openapi(p):
  if not os.path.exists(p): 
    print(f"::warning ::{p} not found; skipping"); 
    sys.exit(0)
  with open(p,"r",encoding="utf-8") as f: o=json.load(f)
  eps=set()
  for path,item in o.get("paths",{}).items():
    for method in item.keys():
      if method.upper() in ["GET","POST","PUT","PATCH","DELETE"]:
        eps.add((method.upper(),path))
  return eps
def main():
  if not os.path.exists(SPEC_MD): sys.exit(0)
  exp=parse_expected_endpoints(open(SPEC_MD,"r",encoding="utf-8").read())
  act=parse_openapi(OPENAPI)
  missing=exp-act; extra=act-exp
  if missing: print("::error ::Endpoints missing in OpenAPI:",missing)
  if extra: print("::warning ::Extra endpoints not in Master Spec:",extra)
  sys.exit(1 if missing else 0)
if __name__=="__main__": main()
