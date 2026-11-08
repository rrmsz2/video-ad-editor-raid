# Crops the user's screenshots and pixelates the targeted email address.
import sys
from PIL import Image, ImageFilter
U = '/root/.claude/uploads/91bf2700-768f-58ef-9c67-ee280ca043bf/'
s = 1125 / 924
def px(im, box):
    b = tuple(int(v * s) for v in box)
    reg = im.crop(b)
    small = reg.resize((max(1, reg.width // 14), max(1, reg.height // 14)), Image.BILINEAR)
    im.paste(small.resize(reg.size, Image.NEAREST), b)
pdf = Image.open(U + 'a6c64b0c-image.png').convert('RGB')
px(pdf, (612, 786, 770, 814))           # email in "Employee Information"
pdf.crop(tuple(int(v * s) for v in (120, 306, 806, 1414))).save('assets/email.png')
br = Image.open(U + 'a8cefa99-image.png').convert('RGB')
px(br, (314, 1122, 610, 1158))          # prefilled email in fake login
br.crop(tuple(int(v * s) for v in (0, 136, 924, 1818))).save('assets/browser.png')
Image.open(U + '059c9c98-image.png').save('assets/logo.png')
