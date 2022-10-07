// TODO: imports --> avdl imports
// TODO: Logical types
// TODO: Make sure we're in the right context (e.g. property inside interface)
// TODO: Preserve comments
// TODO: Decimal

import * as ts from "typescript";
import write from "./avdl/writer";
import {FieldDeclaration, PrimitiveType, ProtocolDeclaration, RecordDeclaration, Type} from "./avdl/types";
import {readFileSync} from "fs";
import path from "path";

export function toProtocolDeclaration(sourceFile: ts.SourceFile): ProtocolDeclaration {
    return traverseSourceFile(sourceFile);

    function conversionError(node: ts.ReadonlyTextRange, message: string): ConversionError {
        return new ConversionError(message, sourceFile.getLineAndCharacterOfPosition(node.pos));
    }

    function traverseTypeLiteral(node: ts.TypeLiteralNode): FieldDeclaration[] {
        const fields: FieldDeclaration[] = [];

        ts.forEachChild(node, child => {
            switch (child.kind) {
                case ts.SyntaxKind.PropertySignature:
                    fields.push(traversePropertySignature(child as ts.PropertySignature));
                    break;
                default:
                    throw conversionError(child,`Unknown element type ${decodeSyntaxKind(child.kind)} in the context of ${decodeSyntaxKind(node.kind)}`);
            }
        });

        return fields;
    }

    function traverseDecl(decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): RecordDeclaration {
        const fields: FieldDeclaration[] = [];

        ts.forEachChild(decl, child => {
            switch (child.kind) {
                case ts.SyntaxKind.Identifier:
                    break;
                case ts.SyntaxKind.PropertySignature:
                    fields.push(traversePropertySignature(child as ts.PropertySignature));
                    break;
                case ts.SyntaxKind.TypeLiteral:
                    fields.push(...traverseTypeLiteral(child as ts.TypeLiteralNode))
                    break;
                default:
                    console.log(`Unknown element type ${decodeSyntaxKind(child.kind)} in the context of ${decodeSyntaxKind(decl.kind)}`);
            }
        });

        return {
            name: decl.name.text,
            fields,
        };
    }

    // TODO: Make the return value typed
    function commentToAvroAnnotation(range: ts.CommentRange): string | undefined {
        const commentText = sourceFile.getFullText().slice(range.pos, range.end);

        if (commentText.startsWith('// @avro ')) {
            return commentText.substring('// @avro '.length);
        }

        return;
    }

    function toType(type: ts.Node, nullable: boolean, annotations: string[], propertyName: string): Type {
        switch (type.kind) {
            case ts.SyntaxKind.StringKeyword:
                if (annotations.includes('uuid')) {
                    return {nullable, type: "uuid"}
                }

                return {nullable, type: "string"};

            case ts.SyntaxKind.BooleanKeyword:
                return {nullable, type: 'boolean'};

            case ts.SyntaxKind.NumberKeyword:
                const possibleTypes: (PrimitiveType & string)[] = [
                    'int', 'long', 'float', 'double', 'date', 'time_ms', 'timestamp_ms', 'local_timestamp_ms'
                ];
                const numberType = possibleTypes.find(type => annotations.includes(type));

                if (numberType === undefined) {
                    throw conversionError(type, `${propertyName} has no specialized type. Please prefix it with // @avro {type}, with the type being one of ${possibleTypes.join(', ')}`);
                }

                return {nullable, type: numberType as PrimitiveType};
            case ts.SyntaxKind.TypeReference:
                const {typeName} = type as ts.TypeReferenceNode;

                if (typeName.kind === ts.SyntaxKind.Identifier) {
                    if (typeName.text === Uint8Array.name) {
                        return {nullable, type: "bytes"};
                    }

                    throw conversionError(type, `Using a custom type like ${typeName.text} is not supported.`);
                }

                throw conversionError(type, "We don't yet support QualifiedName as a TypeReference for a property.")

            case ts.SyntaxKind.LiteralType:
                const {literal} = type as ts.LiteralTypeNode;

                if (literal.kind === ts.SyntaxKind.NullKeyword) {
                    return {nullable: false, type: "null"}
                }

                break;
        }

        throw conversionError(type, `Unsupported type kind ${decodeSyntaxKind(type.kind)}`);
    }

    function getAvroAnnotationsBefore(hasPosition: ts.ReadonlyTextRange): string[] {
        return (ts.getLeadingCommentRanges(sourceFile.getFullText(), hasPosition.pos) || [])
            .map(cr => commentToAvroAnnotation(cr))
            .filter((s): s is string => true);
    }

    function traversePropertySignature(prop: ts.PropertySignature): FieldDeclaration {
        if (!('escapedText' in prop.name)) {
            throw conversionError(prop, "Property has no name?");
        }

        const propertyName = prop.name.text;

        if (!prop.type) {
            throw conversionError(prop, "Property has no type?");
        }

        const type: Type = toType(prop.type, !!prop.questionToken, getAvroAnnotationsBefore(prop), propertyName);

        return {
            name: propertyName,
            type,
            defaultValue: undefined,
        };
    }

    function traverseSourceFile(node: ts.SourceFile): ProtocolDeclaration {
        const declarations: (RecordDeclaration)[] = [];

        ts.forEachChild(node, child => {
            switch (child.kind) {
                case ts.SyntaxKind.InterfaceDeclaration:
                    declarations.push(traverseDecl(child as ts.InterfaceDeclaration));
                    break;
                case ts.SyntaxKind.TypeAliasDeclaration:
                    declarations.push(traverseDecl(child as ts.TypeAliasDeclaration));
                    break;
                case ts.SyntaxKind.EndOfFileToken:
                    break;
                default:
                    throw conversionError(child, `Unknown element type ${decodeSyntaxKind(child.kind)} in the context of a SourceFile.`);
            }
        });

        const fileName = path.basename(path.basename(sourceFile.fileName), path.extname(sourceFile.fileName));

        return {
            name: fileName[0].toUpperCase() + fileName.substring(1),
            declarations
        };
    }
}

export function toAvroIdl(fileName: string): string {
    const contents = readFileSync(fileName).toString();
    const sourceFile = ts.createSourceFile(fileName, contents, ts.ScriptTarget.ES5);
    const protocol: ProtocolDeclaration = toProtocolDeclaration(sourceFile);
    return `// Autogenerated from ${fileName}.\n${write(protocol).replace(/^\t+$/mg, '')}`;
}

function decodeSyntaxKind(kind: ts.SyntaxKind): string {
    return decodedSyntaxKind[kind] || kind.toString();
}

export class ConversionError extends Error {
    readonly line: number;
    readonly character: number;
    readonly rawMessage: string;

    constructor(message: string, lineAndChar: ts.LineAndCharacter) {
        super(`Error at line ${lineAndChar.line}, character ${lineAndChar.character}: ${message}`);

        this.line = lineAndChar.line;
        this.character = lineAndChar.character;
        this.rawMessage = message;
    }
}

const decodedSyntaxKind = {
    0: 'Unknown',
    1: 'EndOfFileToken',
    2: 'SingleLineCommentTrivia',
    3: 'MultiLineCommentTrivia',
    4: 'NewLineTrivia',
    5: 'WhitespaceTrivia',
    6: 'ShebangTrivia',
    7: 'ConflictMarkerTrivia',
    8: 'NumericLiteral',
    9: 'BigIntLiteral',
    10: 'StringLiteral',
    11: 'JsxText',
    12: 'JsxTextAllWhiteSpaces',
    13: 'RegularExpressionLiteral',
    14: 'NoSubstitutionTemplateLiteral',
    15: 'TemplateHead',
    16: 'TemplateMiddle',
    17: 'TemplateTail',
    18: 'OpenBraceToken',
    19: 'CloseBraceToken',
    20: 'OpenParenToken',
    21: 'CloseParenToken',
    22: 'OpenBracketToken',
    23: 'CloseBracketToken',
    24: 'DotToken',
    25: 'DotDotDotToken',
    26: 'SemicolonToken',
    27: 'CommaToken',
    28: 'QuestionDotToken',
    29: 'LessThanToken',
    30: 'LessThanSlashToken',
    31: 'GreaterThanToken',
    32: 'LessThanEqualsToken',
    33: 'GreaterThanEqualsToken',
    34: 'EqualsEqualsToken',
    35: 'ExclamationEqualsToken',
    36: 'EqualsEqualsEqualsToken',
    37: 'ExclamationEqualsEqualsToken',
    38: 'EqualsGreaterThanToken',
    39: 'PlusToken',
    40: 'MinusToken',
    41: 'AsteriskToken',
    42: 'AsteriskAsteriskToken',
    43: 'SlashToken',
    44: 'PercentToken',
    45: 'PlusPlusToken',
    46: 'MinusMinusToken',
    47: 'LessThanLessThanToken',
    48: 'GreaterThanGreaterThanToken',
    49: 'GreaterThanGreaterThanGreaterThanToken',
    50: 'AmpersandToken',
    51: 'BarToken',
    52: 'CaretToken',
    53: 'ExclamationToken',
    54: 'TildeToken',
    55: 'AmpersandAmpersandToken',
    56: 'BarBarToken',
    57: 'QuestionToken',
    58: 'ColonToken',
    59: 'AtToken',
    60: 'QuestionQuestionToken',
    61: 'BacktickToken',
    62: 'HashToken',
    63: 'EqualsToken',
    64: 'PlusEqualsToken',
    65: 'MinusEqualsToken',
    66: 'AsteriskEqualsToken',
    67: 'AsteriskAsteriskEqualsToken',
    68: 'SlashEqualsToken',
    69: 'PercentEqualsToken',
    70: 'LessThanLessThanEqualsToken',
    71: 'GreaterThanGreaterThanEqualsToken',
    72: 'GreaterThanGreaterThanGreaterThanEqualsToken',
    73: 'AmpersandEqualsToken',
    74: 'BarEqualsToken',
    75: 'BarBarEqualsToken',
    76: 'AmpersandAmpersandEqualsToken',
    77: 'QuestionQuestionEqualsToken',
    78: 'CaretEqualsToken',
    79: 'Identifier',
    80: 'PrivateIdentifier',
    81: 'BreakKeyword',
    82: 'CaseKeyword',
    83: 'CatchKeyword',
    84: 'ClassKeyword',
    85: 'ConstKeyword',
    86: 'ContinueKeyword',
    87: 'DebuggerKeyword',
    88: 'DefaultKeyword',
    89: 'DeleteKeyword',
    90: 'DoKeyword',
    91: 'ElseKeyword',
    92: 'EnumKeyword',
    93: 'ExportKeyword',
    94: 'ExtendsKeyword',
    95: 'FalseKeyword',
    96: 'FinallyKeyword',
    97: 'ForKeyword',
    98: 'FunctionKeyword',
    99: 'IfKeyword',
    100: 'ImportKeyword',
    101: 'InKeyword',
    102: 'InstanceOfKeyword',
    103: 'NewKeyword',
    104: 'NullKeyword',
    105: 'ReturnKeyword',
    106: 'SuperKeyword',
    107: 'SwitchKeyword',
    108: 'ThisKeyword',
    109: 'ThrowKeyword',
    110: 'TrueKeyword',
    111: 'TryKeyword',
    112: 'TypeOfKeyword',
    113: 'VarKeyword',
    114: 'VoidKeyword',
    115: 'WhileKeyword',
    116: 'WithKeyword',
    117: 'ImplementsKeyword',
    118: 'InterfaceKeyword',
    119: 'LetKeyword',
    120: 'PackageKeyword',
    121: 'PrivateKeyword',
    122: 'ProtectedKeyword',
    123: 'PublicKeyword',
    124: 'StaticKeyword',
    125: 'YieldKeyword',
    126: 'AbstractKeyword',
    127: 'AsKeyword',
    128: 'AssertsKeyword',
    129: 'AssertKeyword',
    130: 'AnyKeyword',
    131: 'AsyncKeyword',
    132: 'AwaitKeyword',
    133: 'BooleanKeyword',
    134: 'ConstructorKeyword',
    135: 'DeclareKeyword',
    136: 'GetKeyword',
    137: 'InferKeyword',
    138: 'IntrinsicKeyword',
    139: 'IsKeyword',
    140: 'KeyOfKeyword',
    141: 'ModuleKeyword',
    142: 'NamespaceKeyword',
    143: 'NeverKeyword',
    144: 'OutKeyword',
    145: 'ReadonlyKeyword',
    146: 'RequireKeyword',
    147: 'NumberKeyword',
    148: 'ObjectKeyword',
    149: 'SetKeyword',
    150: 'StringKeyword',
    151: 'SymbolKeyword',
    152: 'TypeKeyword',
    153: 'UndefinedKeyword',
    154: 'UniqueKeyword',
    155: 'UnknownKeyword',
    156: 'FromKeyword',
    157: 'GlobalKeyword',
    158: 'BigIntKeyword',
    159: 'OverrideKeyword',
    160: 'OfKeyword',
    161: 'QualifiedName',
    162: 'ComputedPropertyName',
    163: 'TypeParameter',
    164: 'Parameter',
    165: 'Decorator',
    166: 'PropertySignature',
    167: 'PropertyDeclaration',
    168: 'MethodSignature',
    169: 'MethodDeclaration',
    170: 'ClassStaticBlockDeclaration',
    171: 'Constructor',
    172: 'GetAccessor',
    173: 'SetAccessor',
    174: 'CallSignature',
    175: 'ConstructSignature',
    176: 'IndexSignature',
    177: 'TypePredicate',
    178: 'TypeReference',
    179: 'FunctionType',
    180: 'ConstructorType',
    181: 'TypeQuery',
    182: 'TypeLiteral',
    183: 'ArrayType',
    184: 'TupleType',
    185: 'OptionalType',
    186: 'RestType',
    187: 'UnionType',
    188: 'IntersectionType',
    189: 'ConditionalType',
    190: 'InferType',
    191: 'ParenthesizedType',
    192: 'ThisType',
    193: 'TypeOperator',
    194: 'IndexedAccessType',
    195: 'MappedType',
    196: 'LiteralType',
    197: 'NamedTupleMember',
    198: 'TemplateLiteralType',
    199: 'TemplateLiteralTypeSpan',
    200: 'ImportType',
    201: 'ObjectBindingPattern',
    202: 'ArrayBindingPattern',
    203: 'BindingElement',
    204: 'ArrayLiteralExpression',
    205: 'ObjectLiteralExpression',
    206: 'PropertyAccessExpression',
    207: 'ElementAccessExpression',
    208: 'CallExpression',
    209: 'NewExpression',
    210: 'TaggedTemplateExpression',
    211: 'TypeAssertionExpression',
    212: 'ParenthesizedExpression',
    213: 'FunctionExpression',
    214: 'ArrowFunction',
    215: 'DeleteExpression',
    216: 'TypeOfExpression',
    217: 'VoidExpression',
    218: 'AwaitExpression',
    219: 'PrefixUnaryExpression',
    220: 'PostfixUnaryExpression',
    221: 'BinaryExpression',
    222: 'ConditionalExpression',
    223: 'TemplateExpression',
    224: 'YieldExpression',
    225: 'SpreadElement',
    226: 'ClassExpression',
    227: 'OmittedExpression',
    228: 'ExpressionWithTypeArguments',
    229: 'AsExpression',
    230: 'NonNullExpression',
    231: 'MetaProperty',
    232: 'SyntheticExpression',
    233: 'TemplateSpan',
    234: 'SemicolonClassElement',
    235: 'Block',
    236: 'EmptyStatement',
    237: 'VariableStatement',
    238: 'ExpressionStatement',
    239: 'IfStatement',
    240: 'DoStatement',
    241: 'WhileStatement',
    242: 'ForStatement',
    243: 'ForInStatement',
    244: 'ForOfStatement',
    245: 'ContinueStatement',
    246: 'BreakStatement',
    247: 'ReturnStatement',
    248: 'WithStatement',
    249: 'SwitchStatement',
    250: 'LabeledStatement',
    251: 'ThrowStatement',
    252: 'TryStatement',
    253: 'DebuggerStatement',
    254: 'VariableDeclaration',
    255: 'VariableDeclarationList',
    256: 'FunctionDeclaration',
    257: 'ClassDeclaration',
    258: 'InterfaceDeclaration',
    259: 'TypeAliasDeclaration',
    260: 'EnumDeclaration',
    261: 'ModuleDeclaration',
    262: 'ModuleBlock',
    263: 'CaseBlock',
    264: 'NamespaceExportDeclaration',
    265: 'ImportEqualsDeclaration',
    266: 'ImportDeclaration',
    267: 'ImportClause',
    268: 'NamespaceImport',
    269: 'NamedImports',
    270: 'ImportSpecifier',
    271: 'ExportAssignment',
    272: 'ExportDeclaration',
    273: 'NamedExports',
    274: 'NamespaceExport',
    275: 'ExportSpecifier',
    276: 'MissingDeclaration',
    277: 'ExternalModuleReference',
    278: 'JsxElement',
    279: 'JsxSelfClosingElement',
    280: 'JsxOpeningElement',
    281: 'JsxClosingElement',
    282: 'JsxFragment',
    283: 'JsxOpeningFragment',
    284: 'JsxClosingFragment',
    285: 'JsxAttribute',
    286: 'JsxAttributes',
    287: 'JsxSpreadAttribute',
    288: 'JsxExpression',
    289: 'CaseClause',
    290: 'DefaultClause',
    291: 'HeritageClause',
    292: 'CatchClause',
    293: 'AssertClause',
    294: 'AssertEntry',
    295: 'ImportTypeAssertionContainer',
    296: 'PropertyAssignment',
    297: 'ShorthandPropertyAssignment',
    298: 'SpreadAssignment',
    299: 'EnumMember',
    300: 'UnparsedPrologue',
    301: 'UnparsedPrepend',
    302: 'UnparsedText',
    303: 'UnparsedInternalText',
    304: 'UnparsedSyntheticReference',
    305: 'SourceFile',
    306: 'Bundle',
    307: 'UnparsedSource',
    308: 'InputFiles',
    309: 'JSDocTypeExpression',
    310: 'JSDocNameReference',
    311: 'JSDocMemberName',
    312: 'JSDocAllType',
    313: 'JSDocUnknownType',
    314: 'JSDocNullableType',
    315: 'JSDocNonNullableType',
    316: 'JSDocOptionalType',
    317: 'JSDocFunctionType',
    318: 'JSDocVariadicType',
    319: 'JSDocNamepathType',
    320: 'JSDoc',
    321: 'JSDocText',
    322: 'JSDocTypeLiteral',
    323: 'JSDocSignature',
    324: 'JSDocLink',
    325: 'JSDocLinkCode',
    326: 'JSDocLinkPlain',
    327: 'JSDocTag',
    328: 'JSDocAugmentsTag',
    329: 'JSDocImplementsTag',
    330: 'JSDocAuthorTag',
    331: 'JSDocDeprecatedTag',
    332: 'JSDocClassTag',
    333: 'JSDocPublicTag',
    334: 'JSDocPrivateTag',
    335: 'JSDocProtectedTag',
    336: 'JSDocReadonlyTag',
    337: 'JSDocOverrideTag',
    338: 'JSDocCallbackTag',
    339: 'JSDocEnumTag',
    340: 'JSDocParameterTag',
    341: 'JSDocReturnTag',
    342: 'JSDocThisTag',
    343: 'JSDocTypeTag',
    344: 'JSDocTemplateTag',
    345: 'JSDocTypedefTag',
    346: 'JSDocSeeTag',
    347: 'JSDocPropertyTag',
    348: 'SyntaxList',
    349: 'NotEmittedStatement',
    350: 'PartiallyEmittedExpression',
    351: 'CommaListExpression',
    352: 'MergeDeclarationMarker',
    353: 'EndOfDeclarationMarker',
    354: 'SyntheticReferenceExpression',
    355: 'Count',
}
